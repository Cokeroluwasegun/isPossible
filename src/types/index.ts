export interface PricingItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  base_price: number;
  markup_pct: number;
  description?: string;
}

export interface SiteWalk {
  id: string;
  ghl_lead_id: string;
  transcript: string;
  photos: string[];
  scheduled_at: string;
  created_at: string;
}

export interface ProposalLineItem {
  pricing_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface Proposal {
  id: string;
  ghl_lead_id: string;
  site_walk_id: string;
  line_items: ProposalLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending_review' | 'approved' | 'sent' | 'signed';
  marcus_notes?: string;
  rendered_pdf_url?: string;
  stripe_session_id?: string;
  docusign_envelope_id?: string;
  created_at: string;
  approved_at?: string;
  sent_at?: string;
  signed_at?: string;
}

export interface GHLLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  source: 'meta' | 'google_lsa' | 'referral' | 'other';
  budget_range?: string;
  timeline?: string;
  project_type?: string;
  notes?: string;
  status: 'new' | 'qualified' | 'site_walk_scheduled' | 'site_walk_done' | 'proposal_sent' | 'signed' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface ProposalGenerationInput {
  lead: GHLLead;
  site_walk: SiteWalk;
  pricing_items: PricingItem[];
}

export interface ProposalGenerationOutput {
  line_items: Omit<ProposalLineItem, 'total_price'>[];
  scope_summary: string;
  exclusions: string[];
  estimated_timeline_weeks: number;
  requires_3d_render: boolean;
  hoa_required: boolean;
  permits_required: string[];
}

export interface StripeDepositSession {
  url: string;
  session_id: string;
  amount_cents: number;
}

export interface MockDocuSignEnvelope {
  envelope_id: string;
  signing_url: string;
  status: 'sent' | 'completed' | 'declined';
}