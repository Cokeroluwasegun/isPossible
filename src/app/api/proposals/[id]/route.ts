import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // Fetch proposal first
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Fetch related data separately
    const [leadResult, siteWalkResult] = await Promise.all([
      proposal.ghl_lead_id 
        ? supabase.from('ghl_leads').select('id, name, email, phone, address, project_type, budget_range, source, notes').eq('id', proposal.ghl_lead_id).single()
        : Promise.resolve({ data: null, error: null }),
      proposal.site_walk_id
        ? supabase.from('site_walks').select('id, transcript, photos, scheduled_at, completed_at').eq('id', proposal.site_walk_id).single()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const enrichedProposal = {
      ...proposal,
      ghl_leads: leadResult.data,
      site_walks: siteWalkResult.data,
    };

    return NextResponse.json({ proposal: enrichedProposal });
  } catch (error: any) {
    console.error('Fetch proposal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}