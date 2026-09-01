import { createServerSupabaseClient } from '@/lib/supabase';
import { LeadDetail } from '@/components/LeadDetail';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data: lead, error } = await supabase
    .from('ghl_leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Not Found</h1>
            <p className="text-gray-500">The lead you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: siteWalk } = await supabase
    .from('site_walks')
    .select('*')
    .eq('ghl_lead_id', id)
    .single();

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('ghl_lead_id', id)
    .order('created_at', { ascending: false });

  return <LeadDetail lead={lead} siteWalk={siteWalk} proposals={proposals || []} />;
}