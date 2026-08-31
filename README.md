# Greenscape Pro - Proposal Agent

AI-powered proposal generation system for Greenscape Pro, a premium hardscape/landscape design-build company in Phoenix, AZ.

## Overview

This system automates the proposal generation process that currently takes Marcus (Founder/CEO) 6-9 days per proposal. The agent:
1. Ingests site walk transcripts and photos from GoHighLevel (GHL)
2. Uses GPT-4o-mini to map requirements to 200+ pricing line items
3. Generates structured proposals with accurate pricing
4. Provides human-in-the-loop review for Marcus
5. Sends approved proposals via DocuSign with Stripe deposit links

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GHL CRM   │────▶│  Webhook API │────▶│  Supabase   │
│  (Leads,    │     │  (Next.js)   │     │  (PostgreSQL)│
│  Site Walks)│     └──────┬───────┘     └──────┬──────┘
└─────────────┘            │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   OpenAI     │     │  Pricing    │
                    │  GPT-4o-mini │     │  Catalog    │
                    └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Proposal   │
                    │  Generation  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Admin   │ │ Stripe   │ │ DocuSign │
        │  Review  │ │ Deposit  │ │  Signing │
        └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini (structured output)
- **Payments**: Stripe (mock in dev)
- **E-Signature**: DocuSign (mock in dev)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard (Marcus/Jenna)
│   │   ├── page.tsx           # Dashboard with stats
│   │   ├── proposals/         # Proposal list & detail
│   │   ├── leads/             # Lead management
│   │   ├── pricing/           # Pricing catalog
│   │   ├── analytics/         # Conversion metrics
│   │   └── settings/          # Configuration
│   ├── api/
│   │   ├── generate-proposal/ # AI proposal generation
│   │   ├── proposals/         # Proposal CRUD + actions
│   │   └── webhooks/ghl/      # GHL webhook handler
│   ├── mock-checkout/         # Mock Stripe checkout
│   └── mock-docusign/         # Mock DocuSign signing
├── components/
│   ├── ProposalList.tsx       # Proposal table with actions
│   └── ProposalDetail.tsx     # Full proposal view
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── mock-ghl.ts            # Mock GHL CRM
│   ├── pricing-data.ts        # 200+ line items
│   ├── proposal-generator.ts  # OpenAI integration
│   ├── stripe.ts              # Stripe integration
│   ├── docusign.ts            # DocuSign integration
│   └── utils.ts               # Helpers
├── types/
│   └── index.ts               # TypeScript types
└── scripts/
    └── seed-database.ts       # Database seeding
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Stripe account (for production)

### Installation

```bash
cd greenscape-proposal-agent
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key (use test key for dev)

### Database Setup

1. Create a new Supabase project
2. Run the schema from `supabase/schema.sql` in the SQL editor
3. Run the seeding script:

```bash
npx tsx scripts/seed-database.ts
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 - redirects to `/admin`

### Mock Data

The system seeds with 3 sample leads:
1. **Sarah & Mike Johnson** - $60-75K backyard renovation (site walk done)
2. **David Chen** - $35-40K front yard landscape (site walk done)
3. **Maria Rodriguez** - $15-25K patio + pergola (walk scheduled)

## Key Features

### 1. AI Proposal Generation
- Structured output from GPT-4o-mini
- Maps transcript → 200+ pricing items
- Calculates markup, tax, project management (15%), mobilization
- Auto-includes HOA package, permits based on transcript

### 2. Human-in-the-Loop Review
- Marcus reviews in admin UI
- Approve / Request Changes / Send actions
- Stripe deposit (50%) + DocuSign envelope on send

### 3. Mock Integrations (Development)
- **GHL**: Simulated webhooks + local lead storage
- **Stripe**: Mock checkout page at `/mock-checkout`
- **DocuSign**: Mock signing page at `/mock-docusign/[envelopeId]`

### 4. Admin Dashboard
- Pipeline stats (pending, approved, sent, signed)
- Conversion funnel visualization
- Timeline metrics (created→approved, approved→sent)
- Recent proposals with quick actions

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-proposal` | Generate proposal from site walk |
| GET | `/api/proposals` | List all proposals |
| GET | `/api/proposals/[id]` | Get proposal detail |
| POST | `/api/proposals/action` | Approve/send/request changes |
| POST | `/api/webhooks/ghl` | GHL webhook handler |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Database Migration

Run `supabase/schema.sql` in production Supabase before first deploy.

### Webhook Configuration

In production, configure GHL webhooks to point to:
- `https://your-domain.com/api/webhooks/ghl`

Events to subscribe:
- `lead.created`
- `lead.updated`
- `site_walk.completed`
- `proposal.signed`

## Cost Estimates

| Component | Monthly Cost (Est.) |
|-----------|---------------------|
| Supabase (Pro) | $25 |
| OpenAI (GPT-4o-mini) | ~$5-15 (based on usage) |
| Stripe | 2.9% + 30¢ per transaction |
| Vercel (Pro) | $20 |
| **Total** | **~$50-60/mo** |

Per-proposal AI cost: ~$0.02-0.05 (GPT-4o-mini, ~2-5k tokens)

## ROI Calculation

Based on client data:
- **Lost deals/month**: ~13 (35-40% of 150/year qualified leads)
- **Avg deal value**: $28,000
- **Annual revenue at risk**: $1.46M
- **Proposal cycle**: 6-9 days → 1-2 days
- **Payback period**: < 1 week

## Future Enhancements (Post-P0)

1. **Post-Sign Orchestrator** - Automate HOA/permit/deposit follow-up
2. **Progress Communicator** - Auto-updates from CompanyCam/Jobber
3. **Closed-Lost Reactivator** - Personalized re-engagement
4. **Approval Delegator** - Rule engine for change orders/refunds
5. **Real GHL Integration** - Replace mock with actual API
6. **PDF Generation** - Server-side PDF rendering for proposals

## License

Proprietary - isthispossible.ai