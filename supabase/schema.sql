-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pricing items table (from Google Sheets)
CREATE TABLE pricing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  markup_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site walks table
CREATE TABLE site_walks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_lead_id TEXT NOT NULL,
  transcript TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_lead_id TEXT NOT NULL,
  site_walk_id UUID REFERENCES site_walks(id),
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'sent', 'signed')),
  marcus_notes TEXT,
  rendered_pdf_url TEXT,
  stripe_session_id TEXT,
  docusign_envelope_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ
);

-- GHL Leads mirror table (for local querying)
CREATE TABLE ghl_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  source TEXT CHECK (source IN ('meta', 'google_lsa', 'referral', 'other')),
  budget_range TEXT,
  timeline TEXT,
  project_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'site_walk_scheduled', 'site_walk_done', 'proposal_sent', 'signed', 'lost')),
  ghl_created_at TIMESTAMPTZ,
  ghl_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events log for debugging
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposals_ghl_lead ON proposals(ghl_lead_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_site_walks_ghl_lead ON site_walks(ghl_lead_id);
CREATE INDEX idx_ghl_leads_status ON ghl_leads(status);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pricing_items_updated_at BEFORE UPDATE ON pricing_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ghl_leads_updated_at BEFORE UPDATE ON ghl_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();