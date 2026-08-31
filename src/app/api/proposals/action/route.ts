import { createServerSupabaseClient } from '@/lib/supabase';
import { createMockDepositSession } from '@/lib/stripe';
import { createMockDocuSignEnvelope } from '@/lib/docusign';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { proposal_id, action, marcus_notes } = await request.json();
    
    if (!proposal_id || !action) {
      return NextResponse.json({ error: 'proposal_id and action required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select('*, ghl_leads(*)')
      .eq('id', proposal_id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const lead = proposal.ghl_leads;

    switch (action) {
      case 'approve': {
        // Marcus approves the proposal
        const { data: updated, error } = await supabase
          .from('proposals')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            marcus_notes: marcus_notes || null,
          })
          .eq('id', proposal_id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, proposal: updated });
      }

      case 'send': {
        if (proposal.status !== 'approved') {
          return NextResponse.json({ error: 'Proposal must be approved first' }, { status: 400 });
        }

        // Create Stripe deposit session (50% of total)
        const depositAmountCents = Math.round(proposal.total * 0.5 * 100);
        const { url: depositUrl, sessionId } = await createMockDepositSession(
          proposal_id,
          depositAmountCents
        );

        // Create DocuSign envelope
        const { envelopeId, signingUrl } = await createMockDocuSignEnvelope(
          proposal_id,
          lead.email,
          lead.name,
          '' // Would be PDF base64 in production
        );

        // Update proposal with integration IDs
        const { data: updated, error } = await supabase
          .from('proposals')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            stripe_session_id: sessionId,
            docusign_envelope_id: envelopeId,
          })
          .eq('id', proposal_id)
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
          proposal: updated,
          deposit_url: depositUrl,
          docusign_url: signingUrl,
        });
      }

      case 'request_changes': {
        // Send back to draft for revisions
        const { data: updated, error } = await supabase
          .from('proposals')
          .update({
            status: 'draft',
            marcus_notes: marcus_notes || 'Changes requested by Marcus',
          })
          .eq('id', proposal_id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, proposal: updated });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Proposal action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}