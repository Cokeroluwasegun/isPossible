import { createServerSupabaseClient } from '@/lib/supabase';
import { LeadsTable } from '@/components/LeadsTable';

export default async function LeadsPage() {
  const supabase = createServerSupabaseClient();

  const { data: leads } = await supabase
    .from('ghl_leads')
    .select('*')
    .order('created_at', { ascending: false });

  return <LeadsTable initialLeads={leads || []} />;
}