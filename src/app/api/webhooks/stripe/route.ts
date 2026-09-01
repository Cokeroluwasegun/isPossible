import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10' as any,
});

const eventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // For dev without secret, accept all
    return true;
  }
  try {
    return stripe.webhooks.constructEvent(body, signature, secret) !== null;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const parsed = JSON.parse(body);
    const validation = eventSchema.safeParse(parsed);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const event = validation.data;
    const supabase = createServerSupabaseClient();

    // Log event
    await supabase.from('webhook_events').insert({
      source: 'stripe',
      event_type: event.type,
      payload: parsed,
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const proposalId = session.metadata?.proposal_id;
        
        if (proposalId) {
          // Update proposal with payment status
          await supabase
            .from('proposals')
            .update({ 
              status: 'signed',
              signed_at: new Date().toISOString(),
            })
            .eq('id', proposalId);
          
          // Update lead status
          const { data: proposal } = await supabase
            .from('proposals')
            .select('ghl_lead_id')
            .eq('id', proposalId)
            .single();
          
          if (proposal) {
            await supabase
              .from('ghl_leads')
              .update({ status: 'signed', updated_at: new Date().toISOString() })
              .eq('id', proposal.ghl_lead_id);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        console.log('[Stripe Webhook] Payment failed:', event.data.object.id);
        break;
      }
      default:
        console.log('[Stripe Webhook] Unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
