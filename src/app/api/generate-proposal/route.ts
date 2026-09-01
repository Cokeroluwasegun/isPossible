import { createServerSupabaseClient } from '@/lib/supabase';
import { generateProposalFromDatabase } from '@/lib/proposal-generator';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GenerateProposalSchema = z.object({
  ghl_lead_id: z.string().min(1, 'Lead ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const parsed = GenerateProposalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { ghl_lead_id } = parsed.data;

    const supabase = createServerSupabaseClient();
    const { proposal, lead, siteWalk } = await generateProposalFromDatabase(supabase, ghl_lead_id);

    // Calculate totals
    const subtotal = proposal.line_items.reduce((sum, item) => sum + (item as any).total_price, 0);
    const tax = Math.round(subtotal * 0.086 * 100) / 100;
    const total = subtotal + tax;

    // Create proposal record in database
    const { data: proposalRecord, error } = await supabase
      .from('proposals')
      .insert({
        ghl_lead_id: lead.id,
        site_walk_id: siteWalk.id,
        line_items: proposal.line_items,
        subtotal,
        tax,
        total,
        status: 'pending_review',
      })
      .select()
      .single();

    if (error) throw error;

    // Update lead status
    await supabase
      .from('ghl_leads')
      .update({ status: 'proposal_sent', updated_at: new Date().toISOString() })
      .eq('id', lead.id);

    return NextResponse.json({
      success: true,
      proposal: proposalRecord,
      preview: {
        lead_name: lead.name,
        project_type: lead.project_type,
        subtotal,
        tax,
        total,
        timeline_weeks: proposal.estimated_timeline_weeks,
        requires_3d_render: proposal.requires_3d_render,
        hoa_required: proposal.hoa_required,
        scope_summary: proposal.scope_summary,
        line_items_count: proposal.line_items.length,
      },
    });
  } catch (error: any) {
    console.error('Proposal generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}