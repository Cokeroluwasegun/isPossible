import { ProposalList } from '@/components/ProposalList';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  const supabase = createServerSupabaseClient();

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch related data separately
  const leadIds = [...new Set(proposals?.map(p => p.ghl_lead_id).filter(Boolean) || [])];
  const siteWalkIds = [...new Set(proposals?.map(p => p.site_walk_id).filter(Boolean) || [])];

  const [{ data: leads }, { data: siteWalks }] = await Promise.all([
    leadIds.length > 0
      ? supabase.from('ghl_leads').select('id, name, email, project_type, source').in('id', leadIds)
      : { data: [] },
    siteWalkIds.length > 0
      ? supabase.from('site_walks').select('id, completed_at').in('id', siteWalkIds)
      : { data: [] },
  ]);

  const leadMap = new Map(leads?.map(l => [l.id, l]) || []);
  const siteWalkMap = new Map(siteWalks?.map(s => [s.id, s]) || []);

  const enrichedProposals = (proposals || []).map(p => ({
    ...p,
    ghl_leads: leadMap.get(p.ghl_lead_id) || null,
    site_walks: siteWalkMap.get(p.site_walk_id) || null,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Proposals</h1>
          <p className="text-gray-500 mt-1">Manage and track all client proposals</p>
        </div>
      </div>
      <ProposalList initialProposals={enrichedProposals} />
    </div>
  );
}