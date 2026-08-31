import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        ghl_leads:ghl_lead_id (
          id, name, email, phone, address, project_type, budget_range, source, notes
        ),
        site_walks:site_walk_id (
          id, transcript, photos, scheduled_at, completed_at
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ proposal: data });
  } catch (error: any) {
    console.error('Fetch proposal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}