import OpenAI from 'openai';
import { ProposalGenerationInput, ProposalGenerationOutput, PricingItem } from '@/types';
import { PRICING_ITEMS, calculateLineTotal, TAX_RATE } from '@/lib/pricing-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    model: 'gpt-4o',
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  return await generateProposalWithAI(input);
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