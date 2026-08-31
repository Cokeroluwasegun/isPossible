import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10' as any,
});

export async function createDepositSession(
  proposalId: string,
  amountCents: number,
  customerEmail: string,
  customerName: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string; sessionId: string }> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Greenscape Pro - 50% Deposit (Proposal ${proposalId})`,
            description: `Deposit for project: ${proposalId}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    metadata: {
      proposal_id: proposalId,
      type: 'deposit',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { url: session.url!, sessionId: session.id };
}

export async function createMockDepositSession(
  proposalId: string,
  amountCents: number
): Promise<{ url: string; sessionId: string }> {
  // Mock Stripe session for development
  const mockSessionId = `cs_mock_${Date.now()}`;
  const mockUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mock-checkout?session_id=${mockSessionId}&amount=${amountCents}&proposal=${proposalId}`;
  
  return { url: mockUrl, sessionId: mockSessionId };
}

export async function verifyDepositPayment(sessionId: string): Promise<boolean> {
  if (sessionId.startsWith('cs_mock_')) return true;
  
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.payment_status === 'paid';
}

export { stripe };