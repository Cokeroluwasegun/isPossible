import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: proposals, error } = await query;

    if (error) throw error;

    // Fetch related data separately since foreign key relationships may not be cached
    const leadIds = [...new Set(proposals?.map(p => p.ghl_lead_id).filter(Boolean) || [])];
    const siteWalkIds = [...new Set(proposals?.map(p => p.site_walk_id).filter(Boolean) || [])];

    const [{ data: leads }, { data: siteWalks }] = await Promise.all([
      leadIds.length > 0 
        ? supabase.from('ghl_leads').select('id, name, email, phone, address, project_type, budget_range, source').in('id', leadIds)
        : { data: [] },
      siteWalkIds.length > 0
        ? supabase.from('site_walks').select('id, scheduled_at, completed_at').in('id', siteWalkIds)
        : { data: [] },
    ]);

    const leadMap = new Map(leads?.map(l => [l.id, l]) || []);
    const siteWalkMap = new Map(siteWalks?.map(s => [s.id, s]) || []);

    const enrichedProposals = (proposals || []).map(p => ({
      ...p,
      ghl_leads: leadMap.get(p.ghl_lead_id) || null,
      site_walks: siteWalkMap.get(p.site_walk_id) || null,
    }));

    return NextResponse.json({ proposals: enrichedProposals });
  } catch (error: any) {
    console.error('Fetch proposals error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}