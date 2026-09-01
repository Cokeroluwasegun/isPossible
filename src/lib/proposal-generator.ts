import OpenAI from 'openai';
import { ProposalGenerationInput, ProposalGenerationOutput, PricingItem } from '@/types';
import { PRICING_ITEMS, calculateLineTotal, TAX_RATE } from '@/lib/pricing-data';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Check if we're using a mock/test API key
const isMockKey = process.env.GROQ_API_KEY?.startsWith('gsk_') && 
  (process.env.GROQ_API_KEY.includes('mock') || process.env.GROQ_API_KEY.length < 50);

const SYSTEM_PROMPT = `You are an expert hardscape/landscape estimator for Greenscape Pro, a premium Phoenix-based design-build company. Your job is to convert site walk transcripts into detailed, accurate proposal line items using the provided pricing catalog.

COMPANY CONTEXT:
- Premium positioning: quality, reliability, photographable results
- Average project: $28K, range $8K-$120K
- Phoenix, AZ market (heat, HOAs, permits)
- 50% deposit required, 2-6 week build timeline
- Over $30K projects get 3D render from Carlos (lead designer)

PRICING RULES:
- Each pricing item has base_price and markup_pct. Final unit price = base_price * (1 + markup_pct/100)
- Apply 8.6% tax on subtotal
- Project management = 15% of direct costs (use "Project Management (15% of direct costs)" item)
- Mobilization = $650/day based on estimated crew days
- HOA package = $450 if HOA mentioned
- Permit packages vary by scope

ESTIMATION GUIDELINES:
1. Parse transcript for: square footage, linear feet, quantities, specific materials mentioned
2. Match to closest pricing items. If exact match not found, use closest category equivalent
3. Include ALL necessary prep, base, materials, labor, permits
4. For pavers: include base prep, bedding sand, polymeric sand, edge restraint
5. For artificial turf: include base prep, infill, edging
6. For outdoor kitchen: include structure, appliances, countertop, utilities, permits
7. For fire features: include gas line run, permit if needed
8. For pergolas: include footings, permit package
9. For irrigation: include zones, controller, backflow, permit
10. Always include: demo/prep, mobilization, project management, HOA package if applicable

OUTPUT FORMAT (JSON):
{
  "line_items": [
    {"pricing_item_id": "uuid", "quantity": number, "unit_price": number, "notes": "optional context"}
  ],
  "scope_summary": "2-3 sentence executive summary for client",
  "exclusions": ["list of explicit exclusions"],
  "estimated_timeline_weeks": number,
  "requires_3d_render": boolean,
  "hoa_required": boolean,
  "permits_required": ["list of permit types needed"]
}

Be precise. Quantities must be realistic. Use the pricing_item_id from the catalog provided.`;

function buildUserPrompt(input: ProposalGenerationInput): string {
  const pricingCatalog = input.pricing_items.map(item => 
    `${item.id} | ${item.category} | ${item.name} | ${item.unit} | $${item.base_price} | ${item.markup_pct}% markup | ${item.description || ''}`
  ).join('\n');

  return `LEAD INFO:
Name: ${input.lead.name}
Email: ${input.lead.email}
Phone: ${input.lead.phone}
Address: ${input.lead.address}
Source: ${input.lead.source}
Budget Range: ${input.lead.budget_range || 'Not specified'}
Timeline: ${input.lead.timeline || 'Not specified'}
Project Type: ${input.lead.project_type || 'Not specified'}
Notes: ${input.lead.notes || 'None'}

SITE WALK TRANSCRIPT:
${input.site_walk.transcript}

PHOTOS: ${input.site_walk.photos.length} photos available

PRICING CATALOG (id | category | name | unit | base_price | markup_pct | description):
${pricingCatalog}

Generate the proposal line items and metadata as JSON.`;
}

async function generateProposalWithAI(input: ProposalGenerationInput): Promise<ProposalGenerationOutput> {
  const prompt = buildUserPrompt(input);

  const completion = await openai.chat.completions.create({
    model: 'gemma2-9b-it',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from OpenAI');

  let parsed: ProposalGenerationOutput;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON from OpenAI');
  }

  // Validate AI output - guardrails
  const validationErrors = validateProposalOutput(parsed, input);
  if (validationErrors.length > 0) {
    console.error('AI output validation failed:', validationErrors);
    throw new Error(`AI output validation failed: ${validationErrors.join('; ')}`);
  }

  return enrichProposal(parsed, input);
}

// Mock proposal generator for development/testing when no valid API key
function generateProposalMock(input: ProposalGenerationInput): ProposalGenerationOutput {
  // Deterministic mock proposal based on transcript keywords
  const transcript = input.site_walk.transcript.toLowerCase();
  const pricingItems = input.pricing_items;
  
  const findItem = (keywords: string[]) => 
    pricingItems.find(p => keywords.some(k => p.name.toLowerCase().includes(k.toLowerCase())));
  
  const findItemByCategory = (category: string, keywords: string[]) =>
    pricingItems.find(p => p.category.toLowerCase().includes(category.toLowerCase()) && 
      keywords.some(k => p.name.toLowerCase().includes(k.toLowerCase())));

  const lineItems: any[] = [];
  
  // Demo & Prep
  const demoItem = findItem(['demo', 'haul']);
  if (demoItem) lineItems.push({ pricing_item_id: demoItem.id, quantity: 1, notes: 'Site demolition and haul' });
  
  const gradingItem = findItem(['grading']);
  if (gradingItem) lineItems.push({ pricing_item_id: gradingItem.id, quantity: 1, notes: 'Rough grading' });

  // Pavers - look for travertine, paver, etc.
  if (transcript.includes('travertine') || transcript.includes('paver')) {
    const paverItem = findItemByCategory('paver', ['travertine', 'belgarden', 'paver']);
    if (paverItem) {
      const sqft = transcript.includes('1,200') ? 1200 : transcript.includes('1200') ? 1200 : 500;
      lineItems.push({ pricing_item_id: paverItem.id, quantity: sqft, notes: 'Travertine pavers, French pattern' });
      
      // Add base prep, bedding sand, polymeric sand, edge restraint
      const basePrep = findItemByCategory('paver', ['base prep', 'base']);
      if (basePrep) lineItems.push({ pricing_item_id: basePrep.id, quantity: sqft, notes: 'Base prep' });
      const beddingSand = findItemByCategory('paver', ['bedding', 'sand']);
      if (beddingSand) lineItems.push({ pricing_item_id: beddingSand.id, quantity: sqft, notes: 'Bedding sand' });
      const polymericSand = findItemByCategory('paver', ['polymeric', 'sand']);
      if (polymericSand) lineItems.push({ pricing_item_id: polymericSand.id, quantity: sqft, notes: 'Polymeric sand joint fill' });
      const edgeRestraint = findItemByCategory('paver', ['edge', 'restraint']);
      if (edgeRestraint) lineItems.push({ pricing_item_id: edgeRestraint.id, quantity: Math.ceil(sqft / 10), notes: 'Concrete edge restraint' });
    }
  }

  // Outdoor Kitchen
  if (transcript.includes('outdoor kitchen') || transcript.includes('bbq') || transcript.includes('grill')) {
    const island = findItemByCategory('kitchen', ['island', 'base']);
    if (island) lineItems.push({ pricing_item_id: island.id, quantity: 1, notes: 'BBQ island base' });
    
    const grill = findItemByCategory('kitchen', ['grill']);
    if (grill) lineItems.push({ pricing_item_id: grill.id, quantity: 1, notes: 'Grill insert' });
    
    const countertop = findItemByCategory('kitchen', ['countertop', 'granite', 'quartz']);
    if (countertop) lineItems.push({ pricing_item_id: countertop.id, quantity: 50, notes: 'Countertop' });
    
    const fridge = findItemByCategory('kitchen', ['fridge', 'refrigerator']);
    if (fridge) lineItems.push({ pricing_item_id: fridge.id, quantity: 1, notes: 'Outdoor fridge' });
    
    const sink = findItemByCategory('kitchen', ['sink']);
    if (sink) lineItems.push({ pricing_item_id: sink.id, quantity: 1, notes: 'Sink & faucet kit' });
    
    const powerGas = findItemByCategory('kitchen', ['power', 'gas', 'rough']);
    if (powerGas) lineItems.push({ pricing_item_id: powerGas.id, quantity: 1, notes: 'Power & gas rough-in' });
  }

  // Fire Features
  if (transcript.includes('fire pit') || transcript.includes('fireplace')) {
    const firePit = findItemByCategory('fire', ['fire pit', 'firepit']);
    if (firePit) lineItems.push({ pricing_item_id: firePit.id, quantity: 1, notes: 'Fire pit' });
    else {
      const fireplace = findItemByCategory('fire', ['fireplace']);
      if (fireplace) lineItems.push({ pricing_item_id: fireplace.id, quantity: 1, notes: 'Outdoor fireplace' });
    }
    
    const gasLine = findItemByCategory('fire', ['gas line']);
    if (gasLine) lineItems.push({ pricing_item_id: gasLine.id, quantity: 1, notes: 'Gas line run' });
  }

  // Pergola
  if (transcript.includes('pergola')) {
    const pergola = findItemByCategory('structure', ['pergola', 'louvered']);
    if (pergola) lineItems.push({ pricing_item_id: pergola.id, quantity: 1, notes: 'Aluminum louvered pergola' });
    
    const footings = findItemByCategory('structure', ['footing', 'pier']);
    if (footings) lineItems.push({ pricing_item_id: footings.id, quantity: 1, notes: 'Pergola footings' });
    
    const permit = findItemByCategory('structure', ['permit']);
    if (permit) lineItems.push({ pricing_item_id: permit.id, quantity: 1, notes: 'Permit package' });
  }

  // Lighting
  if (transcript.includes('lighting') || transcript.includes('light')) {
    const pathLight = findItemByCategory('accent', ['path light', 'pathlight']);
    if (pathLight) lineItems.push({ pricing_item_id: pathLight.id, quantity: 10, notes: 'Path lights' });
    
    const upLight = findItemByCategory('accent', ['up light', 'uplight']);
    if (upLight) lineItems.push({ pricing_item_id: upLight.id, quantity: 5, notes: 'Up lights' });
    
    const transformer = findItemByCategory('accent', ['transformer']);
    if (transformer) lineItems.push({ pricing_item_id: transformer.id, quantity: 1, notes: 'Transformer & wire' });
  }

  // Irrigation
  if (transcript.includes('irrigation') || transcript.includes('drip') || transcript.includes('zone')) {
    const dripZone = findItemByCategory('irrigation', ['drip zone', 'drip']);
    if (dripZone) lineItems.push({ pricing_item_id: dripZone.id, quantity: 4, notes: 'Drip irrigation zones' });
    
    const backflow = findItemByCategory('irrigation', ['backflow']);
    if (backflow) lineItems.push({ pricing_item_id: backflow.id, quantity: 1, notes: 'Backflow preventer' });
    
    const controller = findItemByCategory('irrigation', ['controller', 'smart']);
    if (controller) lineItems.push({ pricing_item_id: controller.id, quantity: 1, notes: 'Smart controller' });
  }

  // Plantings
  if (transcript.includes('plant') || transcript.includes('tree') || transcript.includes('shrub') || transcript.includes('groundcover')) {
    const tree = findItemByCategory('planting', ['tree', 'palo verde', 'mesquite', 'specimen']);
    if (tree) lineItems.push({ pricing_item_id: tree.id, quantity: 3, notes: 'Trees' });
    
    const shrub = findItemByCategory('planting', ['shrub', 'sage', 'lantana']);
    if (shrub) lineItems.push({ pricing_item_id: shrub.id, quantity: 15, notes: 'Desert shrubs' });
    
    const groundcover = findItemByCategory('planting', ['groundcover', 'flat']);
    if (groundcover) lineItems.push({ pricing_item_id: groundcover.id, quantity: 50, notes: 'Groundcover flats' });
  }

  // Artificial Turf
  if (transcript.includes('turf') || transcript.includes('artificial')) {
    const turf = findItemByCategory('turf', ['turf', 'cooltouch', 'artificial']);
    if (turf) lineItems.push({ pricing_item_id: turf.id, quantity: 3200, notes: 'Artificial turf' });
    
    const basePrep = findItemByCategory('turf', ['base prep', 'prep']);
    if (basePrep) lineItems.push({ pricing_item_id: basePrep.id, quantity: 3200, notes: 'Turf base prep' });
    
    const edging = findItemByCategory('turf', ['edging']);
    if (edging) lineItems.push({ pricing_item_id: edging.id, quantity: 200, notes: 'Turf edging' });
    
    const infill = findItemByCategory('turf', ['infill']);
    if (infill) lineItems.push({ pricing_item_id: infill.id, quantity: 3200, notes: 'Envirofill infill' });
  }

  // Always include demo/prep if not already added
  if (!lineItems.some(i => i.notes?.includes('demolition') || i.notes?.includes('Demo'))) {
    const demo = findItem(['demo', 'haul']);
    if (demo) lineItems.unshift({ pricing_item_id: demo.id, quantity: 1, notes: 'Site demolition and haul' });
  }

  // Build proposal output
  const budget = parseInt(input.lead.budget_range?.replace(/[^0-9]/g, '') || '50000');
  const estimatedTimeline = transcript.includes('pool') ? 6 : transcript.includes('kitchen') ? 5 : 3;
  
  return {
    line_items: lineItems.map(item => ({
      pricing_item_id: item.pricing_item_id,
      quantity: item.quantity,
      unit_price: 0, // Will be enriched later
      total_price: 0, // Will be enriched later
      notes: item.notes,
    })),
    scope_summary: `Complete ${input.lead.project_type || 'landscape renovation'} for ${input.lead.name} at ${input.lead.address}. Project includes site preparation, hardscape installation, and landscape plantings per site walk specifications.`,
    exclusions: ['Permit fees (paid directly to municipality)', 'HOA approval fees', 'Utility connection fees', 'Unforeseen subsurface conditions'],
    estimated_timeline_weeks: estimatedTimeline,
    requires_3d_render: budget > 30000,
    hoa_required: transcript.includes('hoa'),
    permits_required: ['Building permit', transcript.includes('gas') ? 'Gas line permit' : '', transcript.includes('irrigation') ? 'Irrigation backflow permit' : ''].filter(Boolean),
  };
}

// Guardrails: Validate AI output before enrichment
function validateProposalOutput(parsed: ProposalGenerationOutput, input: ProposalGenerationInput): string[] {
  const errors: string[] = [];
  
  if (!parsed.line_items || !Array.isArray(parsed.line_items)) {
    errors.push('line_items must be an array');
    return errors;
  }
  
  if (parsed.line_items.length === 0) {
    errors.push('line_items cannot be empty');
  }
  
  // Validate each line item references a valid pricing item
  for (const item of parsed.line_items) {
    if (!item.pricing_item_id) {
      errors.push('line_item missing pricing_item_id');
      continue;
    }
    const pricingItem = input.pricing_items.find(p => p.id === item.pricing_item_id);
    if (!pricingItem) {
      errors.push(`Invalid pricing_item_id: ${item.pricing_item_id}`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Invalid quantity for ${item.pricing_item_id}: ${item.quantity}`);
    }
  }
  
  // Validate required fields
  if (!parsed.scope_summary || parsed.scope_summary.length < 20) {
    errors.push('scope_summary must be at least 20 characters');
  }
  
  if (typeof parsed.estimated_timeline_weeks !== 'number' || parsed.estimated_timeline_weeks <= 0) {
    errors.push('estimated_timeline_weeks must be a positive number');
  }
  
  if (typeof parsed.requires_3d_render !== 'boolean') {
    errors.push('requires_3d_render must be boolean');
  }
  
  if (typeof parsed.hoa_required !== 'boolean') {
    errors.push('hoa_required must be boolean');
  }
  
  if (!Array.isArray(parsed.permits_required)) {
    errors.push('permits_required must be an array');
  }
  
  if (!Array.isArray(parsed.exclusions)) {
    errors.push('exclusions must be an array');
  }
  
  return errors;
}

export async function generateProposal(input: ProposalGenerationInput): Promise<ProposalGenerationOutput> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is required');
  }
  
  // Use mock generator if API key is mock/test
  if (isMockKey) {
    console.log('[Proposal Generator] Using mock generator (no valid API key)');
    return enrichProposal(generateProposalMock(input), input);
  }

  try {
    return await generateProposalWithAI(input);
  } catch (error) {
    console.warn('[Proposal Generator] AI generation failed, falling back to mock:', error);
    return enrichProposal(generateProposalMock(input), input);
  }
}

function enrichProposal(parsed: ProposalGenerationOutput, input: ProposalGenerationInput): ProposalGenerationOutput {
  // Validate and enrich line items with calculated totals
  const validatedItems = parsed.line_items.map(item => {
    const pricingItem = input.pricing_items.find(p => p.id === item.pricing_item_id);
    if (!pricingItem) {
      console.warn(`Pricing item not found: ${item.pricing_item_id}`);
      return { ...item, total_price: 0 };
    }
    const calculatedUnitPrice = calculateLineTotal(pricingItem, 1);
    const totalPrice = Math.round(calculatedUnitPrice * item.quantity * 100) / 100;
    return {
      ...item,
      unit_price: calculatedUnitPrice,
      total_price: totalPrice,
    };
  });

  const subtotal = validatedItems.reduce((sum, item) => sum + item.total_price, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax;

  // Add project management line item (15% of direct costs)
  const pmItem = input.pricing_items.find(p => p.name.includes('Project Management'));
  if (pmItem) {
    validatedItems.push({
      pricing_item_id: pmItem.id,
      quantity: 1,
      unit_price: Math.round(subtotal * 0.15 * 100) / 100,
      total_price: Math.round(subtotal * 0.15 * 100) / 100,
      notes: '15% of direct costs for project management & supervision',
    });
  }

  // Add mobilization based on estimated timeline
  const mobItem = input.pricing_items.find(p => p.name.includes('Mobilization'));
  if (mobItem && parsed.estimated_timeline_weeks > 0) {
    const crewDays = Math.ceil(parsed.estimated_timeline_weeks * 5 * 0.8);
    validatedItems.push({
      pricing_item_id: mobItem.id,
      quantity: crewDays,
      unit_price: calculateLineTotal(mobItem, 1),
      total_price: Math.round(calculateLineTotal(mobItem, 1) * crewDays * 100) / 100,
      notes: `${crewDays} crew days mobilization & supervision`,
    });
  }

  // Add HOA package if needed
  if (parsed.hoa_required) {
    const hoaItem = input.pricing_items.find(p => p.name.includes('HOA Submission'));
    if (hoaItem) {
      validatedItems.push({
        pricing_item_id: hoaItem.id,
        quantity: 1,
        unit_price: calculateLineTotal(hoaItem, 1),
        total_price: calculateLineTotal(hoaItem, 1),
        notes: 'HOA submission package preparation & management',
      });
    }
  }

  // Recalculate with added items
  const finalSubtotal = validatedItems.reduce((sum, item) => sum + item.total_price, 0);
  const finalTax = Math.round(finalSubtotal * TAX_RATE * 100) / 100;
  const finalTotal = finalSubtotal + finalTax;

  return {
    ...parsed,
    line_items: validatedItems,
  };
}

export async function generateProposalFromDatabase(
  supabase: any,
  ghlLeadId: string
): Promise<{ proposal: ProposalGenerationOutput; lead: any; siteWalk: any; pricingItems: PricingItem[] }> {
  // Fetch lead
  const { data: lead, error: leadError } = await supabase
    .from('ghl_leads')
    .select('*')
    .eq('id', ghlLeadId)
    .single();

  if (leadError || !lead) throw new Error(`Lead not found: ${ghlLeadId}`);

  // Fetch site walk
  const { data: siteWalk, error: swError } = await supabase
    .from('site_walks')
    .select('*')
    .eq('ghl_lead_id', ghlLeadId)
    .single();

  if (swError || !siteWalk) throw new Error(`Site walk not found for lead: ${ghlLeadId}`);

  // Fetch pricing items
  const { data: pricingItems, error: piError } = await supabase
    .from('pricing_items')
    .select('*')
    .order('category', { ascending: true });

  if (piError) throw new Error('Failed to fetch pricing items');

  const proposal = await generateProposal({
    lead,
    site_walk: siteWalk,
    pricing_items: pricingItems as PricingItem[],
  });

  return { proposal, lead, siteWalk, pricingItems: pricingItems as PricingItem[] };
}