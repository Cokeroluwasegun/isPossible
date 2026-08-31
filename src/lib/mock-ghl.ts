import { GHLLead, SiteWalk, Proposal } from '@/types';

const MOCK_LEADS: Map<string, GHLLead> = new Map();
const MOCK_SITE_WALKS: Map<string, SiteWalk> = new Map();
const MOCK_PROPOSALS: Map<string, Proposal> = new Map();

let leadCounter = 1;
let siteWalkCounter = 1;
let proposalCounter = 1;

export const mockGHL = {
  leads: {
    create: (data: Omit<GHLLead, 'id' | 'created_at' | 'updated_at'>): GHLLead => {
      const id = `lead_${leadCounter++}`;
      const now = new Date().toISOString();
      const lead: GHLLead = { ...data, id, created_at: now, updated_at: now };
      MOCK_LEADS.set(id, lead);
      return lead;
    },

    get: (id: string): GHLLead | undefined => MOCK_LEADS.get(id),

    update: (id: string, data: Partial<GHLLead>): GHLLead | undefined => {
      const lead = MOCK_LEADS.get(id);
      if (!lead) return undefined;
      const updated = { ...lead, ...data, updated_at: new Date().toISOString() };
      MOCK_LEADS.set(id, updated);
      return updated;
    },

    list: (filters?: { status?: GHLLead['status'] }): GHLLead[] => {
      let leads = Array.from(MOCK_LEADS.values());
      if (filters?.status) {
        leads = leads.filter(l => l.status === filters.status);
      }
      return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    // Simulate webhook: lead.created
    triggerLeadCreated: (lead: GHLLead) => {
      console.log('[MOCK GHL] Webhook: lead.created', lead.id);
      return { event: 'lead.created', data: lead };
    },

    // Simulate webhook: lead.site_walk_completed
    triggerSiteWalkCompleted: (leadId: string, siteWalk: SiteWalk) => {
      console.log('[MOCK GHL] Webhook: site_walk_completed', leadId);
      return { event: 'site_walk_completed', data: { lead_id: leadId, site_walk: siteWalk } };
    },
  },

  siteWalks: {
    create: (data: Omit<SiteWalk, 'id' | 'created_at'>): SiteWalk => {
      const id = `sw_${siteWalkCounter++}`;
      const siteWalk: SiteWalk = { ...data, id, created_at: new Date().toISOString() };
      MOCK_SITE_WALKS.set(id, siteWalk);
      return siteWalk;
    },

    get: (id: string): SiteWalk | undefined => MOCK_SITE_WALKS.get(id),

    getByLeadId: (leadId: string): SiteWalk | undefined => {
      return Array.from(MOCK_SITE_WALKS.values()).find(sw => sw.ghl_lead_id === leadId);
    },
  },

  proposals: {
    create: (data: Omit<Proposal, 'id' | 'created_at'>): Proposal => {
      const id = `prop_${proposalCounter++}`;
      const proposal: Proposal = { ...data, id, created_at: new Date().toISOString() };
      MOCK_PROPOSALS.set(id, proposal);
      return proposal;
    },

    get: (id: string): Proposal | undefined => MOCK_PROPOSALS.get(id),

    update: (id: string, data: Partial<Proposal>): Proposal | undefined => {
      const proposal = MOCK_PROPOSALS.get(id);
      if (!proposal) return undefined;
      const updated = { ...proposal, ...data };
      MOCK_PROPOSALS.set(id, updated);
      return updated;
    },

    getByLeadId: (leadId: string): Proposal | undefined => {
      return Array.from(MOCK_PROPOSALS.values()).find(p => p.ghl_lead_id === leadId);
    },

    // Simulate sending proposal via GHL
    send: async (proposalId: string): Promise<{ success: boolean; envelopeId?: string }> => {
      const proposal = MOCK_PROPOSALS.get(proposalId);
      if (!proposal) return { success: false };
      
      const envelopeId = `docusign_${Date.now()}`;
      MOCK_PROPOSALS.set(proposalId, { 
        ...proposal, 
        status: 'sent', 
        sent_at: new Date().toISOString(),
        docusign_envelope_id: envelopeId
      });
      
      console.log('[MOCK GHL] Proposal sent via DocuSign', { proposalId, envelopeId });
      return { success: true, envelopeId };
    },
  },

  // Reset for testing
  reset: () => {
    MOCK_LEADS.clear();
    MOCK_SITE_WALKS.clear();
    MOCK_PROPOSALS.clear();
    leadCounter = 1;
    siteWalkCounter = 1;
    proposalCounter = 1;
  },

  // Seed with sample data
  seed: () => {
    const lead1 = mockGHL.leads.create({
      name: 'Sarah & Mike Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(602) 555-0147',
      address: '8432 E Desert Cove Ave, Scottsdale, AZ 85260',
      source: 'meta',
      budget_range: '$50,000 - $75,000',
      timeline: '2-3 months',
      project_type: 'Full backyard renovation with pool, patio, outdoor kitchen',
      notes: 'Interested in travertine patio, built-in BBQ, fire pit. HOA requires approval.',
      status: 'site_walk_done',
    });

    const lead2 = mockGHL.leads.create({
      name: 'David Chen',
      email: 'dchen@techcorp.com',
      phone: '(480) 555-0289',
      address: '1245 W University Dr, Tempe, AZ 85281',
      source: 'google_lsa',
      budget_range: '$30,000 - $45,000',
      timeline: 'ASAP',
      project_type: 'Front yard landscape + irrigation + artificial turf',
      notes: 'Wants low maintenance. HOA pre-approved similar projects.',
      status: 'site_walk_done',
    });

    const lead3 = mockGHL.leads.create({
      name: 'Maria Rodriguez',
      email: 'maria.r@healthcare.org',
      phone: '(623) 555-0392',
      address: '4521 N 67th Ave, Phoenix, AZ 85033',
      source: 'referral',
      budget_range: '$15,000 - $25,000',
      timeline: 'Before summer',
      project_type: 'Paver patio + pergola + fire pit',
      notes: 'Referred by Johnson family. Wants to entertain.',
      status: 'site_walk_scheduled',
    });

    // Site walks for completed leads
    const sw1 = mockGHL.siteWalks.create({
      ghl_lead_id: lead1.id,
      transcript: `Site walk with Sarah and Mike Johnson at 8432 E Desert Cove Ave.
      
Property: 0.35 acre lot, backyard slopes slightly toward northeast. Existing concrete patio (400 sq ft) in poor condition - cracking, settling. Mature mesquite tree on west side to remain. Pool equipment pad on east side.

Client wants:
- Remove existing patio, install 1,200 sq ft travertine pavers (Silver Travertine, French pattern)
- Built-in outdoor kitchen: 6' linear feet counter, grill insert, fridge, sink, storage
- Gas fire pit: 48" round, Arizona sandstone coping, automatic ignition
- Pergola: 16x20 aluminum louvered roof, integrated LED lighting, fans
- Landscape lighting: path lights, up-lights on tree, kitchen task lighting
- Irrigation updates for new plantings
- Plantings: 15-gallon olive tree, 5-gallon shrubs (Texas sage, lantana), groundcover

Budget discussion: They mentioned $60-75K range. Timeline: want to start in 4-6 weeks after HOA approval.

Concerns: HOA review takes 3-4 weeks. Need to pull permit for gas line and pergola footings.`,
      photos: [
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      ],
      scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const sw2 = mockGHL.siteWalks.create({
      ghl_lead_id: lead2.id,
      transcript: `Site walk with David Chen at 1245 W University Dr.
      
Property: 6,500 sq ft lot, front yard only (backyard already done). Existing Bermuda grass lawn, flood irrigation. No HOA (unincorporated Maricopa County). City of Tempe permit required for irrigation backflow.

Client wants:
- Remove 3,200 sq ft Bermuda, install artificial turf (CoolTouch Pro, 1.75" pile)
- New drip irrigation zones for perimeter plantings (4 zones)
- 120 linear feet steel edging
- Plantings: 3x 24" box Palo Verde trees, 10x 5-gallon desert shrubs, 50x 1-gallon groundcover
- 600 sq ft decomposed granite pathways with stabilizer
- Boulder accent: 3x 2-3ft decorative boulders

Budget: $35-40K. Timeline: "ASAP, before summer heat". No HOA delays. Permit only for irrigation backflow preventer.`,
      photos: [
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
        'https://images.unsplash.com/photo-1416879595882-337301440334?w=800',
      ],
      scheduled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Update lead statuses
    mockGHL.leads.update(lead1.id, { status: 'site_walk_done' });
    mockGHL.leads.update(lead2.id, { status: 'site_walk_done' });
    mockGHL.leads.update(lead3.id, { status: 'site_walk_scheduled' });

    console.log('[MOCK GHL] Seeded with 3 leads, 2 completed site walks');
    return { lead1, lead2, lead3, sw1, sw2 };
  },
};

// Auto-seed on import in development
if (process.env.NODE_ENV === 'development') {
  mockGHL.seed();
}