import { ProposalList } from '@/components/ProposalList';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function ProposalsPage() {
  const supabase = createServerSupabaseClient();

  const { data: proposals } = await supabase
    .from('proposals')
    .select(`
      *,
      ghl_leads:ghl_lead_id (id, name, email, project_type, source),
      site_walks:site_walk_id (id, completed_at)
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Proposals</h1>
          <p className="text-gray-500 mt-1">Manage and track all client proposals</p>
        </div>
      </div>
      <ProposalList initialProposals={proposals || []} />
    </div>
  );
}