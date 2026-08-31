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
      .select(`
        *,
        ghl_leads:ghl_lead_id (
          id, name, email, phone, address, project_type, budget_range, source
        ),
        site_walks:site_walk_id (
          id, scheduled_at, completed_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ proposals: data || [] });
  } catch (error: any) {
    console.error('Fetch proposals error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}