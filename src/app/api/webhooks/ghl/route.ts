import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) {
    // If no secret configured, accept webhooks for backwards compatibility
    return true;
  }
  try {
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature || '')) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const parsed = JSON.parse(body);
    const supabase = createServerSupabaseClient();

    // Log webhook event
    await supabase.from('webhook_events').insert({
      source: 'ghl',
      event_type: parsed.type || 'unknown',
      payload: parsed,
    });

    // Handle different GHL webhook events
    switch (parsed.type) {
      case 'lead.created':
        await handleLeadCreated(supabase, parsed.data);
        break;
      case 'lead.updated':
        await handleLeadUpdated(supabase, parsed.data);
        break;
      case 'site_walk.completed':
        await handleSiteWalkCompleted(supabase, parsed.data);
        break;
      case 'proposal.signed':
        await handleProposalSigned(supabase, parsed.data);
        break;
      default:
        console.log('[Webhook] Unhandled event type:', parsed.type);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // Don't fail webhook - just log
    return NextResponse.json({ success: true, error: error.message });
  }
}

async function handleLeadCreated(supabase: any, data: any) {
  const lead = {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    source: mapSource(data.source),
    budget_range: data.custom_fields?.budget_range,
    timeline: data.custom_fields?.timeline,
    project_type: data.custom_fields?.project_type,
    notes: data.notes,
    status: 'new',
    ghl_created_at: data.created_at,
    ghl_updated_at: data.updated_at,
  };

  await supabase.from('ghl_leads').upsert(lead, { onConflict: 'id' });
  console.log('[Webhook] Lead created:', lead.id);
}

async function handleLeadUpdated(supabase: any, data: any) {
  const updates: any = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    ghl_updated_at: data.updated_at,
    updated_at: new Date().toISOString(),
  };

  if (data.custom_fields?.budget_range) updates.budget_range = data.custom_fields.budget_range;
  if (data.custom_fields?.timeline) updates.timeline = data.custom_fields.timeline;
  if (data.custom_fields?.project_type) updates.project_type = data.custom_fields.project_type;
  if (data.notes) updates.notes = data.notes;
  if (data.status) updates.status = mapStatus(data.status);

  await supabase.from('ghl_leads').update(updates).eq('id', data.id);
  console.log('[Webhook] Lead updated:', data.id);
}

async function handleSiteWalkCompleted(supabase: any, data: any) {
  const siteWalk = {
    ghl_lead_id: data.lead_id,
    transcript: data.transcript,
    photos: data.photos || [],
    scheduled_at: data.scheduled_at,
    completed_at: data.completed_at || new Date().toISOString(),
  };

  await supabase.from('site_walks').upsert(siteWalk, { onConflict: 'ghl_lead_id' });
  
  // Update lead status
  await supabase
    .from('ghl_leads')
    .update({ status: 'site_walk_done', updated_at: new Date().toISOString() })
    .eq('id', data.lead_id);

  console.log('[Webhook] Site walk completed for lead:', data.lead_id);
}

async function handleProposalSigned(supabase: any, data: any) {
  await supabase
    .from('proposals')
    .update({ 
      status: 'signed', 
      signed_at: new Date().toISOString(),
      docusign_envelope_id: data.envelope_id,
    })
    .eq('ghl_lead_id', data.lead_id);

  await supabase
    .from('ghl_leads')
    .update({ status: 'signed', updated_at: new Date().toISOString() })
    .eq('id', data.lead_id);

  console.log('[Webhook] Proposal signed for lead:', data.lead_id);
}

function mapSource(source: string): 'meta' | 'google_lsa' | 'referral' | 'other' {
  const s = source?.toLowerCase() || '';
  if (s.includes('meta') || s.includes('facebook') || s.includes('instagram')) return 'meta';
  if (s.includes('google') || s.includes('lsa') || s.includes('local service')) return 'google_lsa';
  if (s.includes('referral') || s.includes('refer')) return 'referral';
  return 'other';
}

function mapStatus(status: string): 'new' | 'qualified' | 'site_walk_scheduled' | 'site_walk_done' | 'proposal_sent' | 'signed' | 'lost' {
  const s = status?.toLowerCase() || '';
  if (s.includes('qualified')) return 'qualified';
  if (s.includes('site walk') && s.includes('scheduled')) return 'site_walk_scheduled';
  if (s.includes('site walk') && (s.includes('done') || s.includes('complete'))) return 'site_walk_done';
  if (s.includes('proposal') && s.includes('sent')) return 'proposal_sent';
  if (s.includes('signed') || s.includes('won') || s.includes('closed')) return 'signed';
  if (s.includes('lost') || s.includes('dead')) return 'lost';
  return 'new';
}