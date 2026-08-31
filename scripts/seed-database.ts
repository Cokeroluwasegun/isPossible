import { createClient } from '@supabase/supabase-js';
import { PRICING_ITEMS } from '../src/lib/pricing-data';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedPricingItems() {
  console.log('Seeding pricing items...');
  
  const items = PRICING_ITEMS.map(item => ({
    ...item,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('pricing_items').upsert(items, { onConflict: 'category,name' });
  
  if (error) {
    console.error('Error seeding pricing items:', error);
    throw error;
  }
  
  console.log(`Seeded ${items.length} pricing items`);
}

async function seedSampleLeads() {
  console.log('Seeding sample leads...');
  
  const leads = [
    {
      id: 'lead_1',
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
      ghl_created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      ghl_updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'lead_2',
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
      ghl_created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ghl_updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'lead_3',
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
      ghl_created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ghl_updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { error } = await supabase.from('ghl_leads').upsert(leads, { onConflict: 'id' });
  
  if (error) {
    console.error('Error seeding leads:', error);
    throw error;
  }
  
  console.log(`Seeded ${leads.length} sample leads`);
}

async function seedSampleSiteWalks() {
  console.log('Seeding sample site walks...');
  
  const siteWalks = [
    {
      ghl_lead_id: 'lead_1',
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
      completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      ghl_lead_id: 'lead_2',
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
      completed_at: new Date().toISOString(),
    },
  ];

  const { error } = await supabase.from('site_walks').upsert(siteWalks, { onConflict: 'ghl_lead_id' });
  
  if (error) {
    console.error('Error seeding site walks:', error);
    throw error;
  }
  
  console.log(`Seeded ${siteWalks.length} sample site walks`);
}

async function main() {
  try {
    await seedPricingItems();
    await seedSampleLeads();
    await seedSampleSiteWalks();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();