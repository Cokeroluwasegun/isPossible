export interface MockDocuSignEnvelope {
  envelopeId: string;
  signingUrl: string;
  status: 'sent' | 'completed' | 'declined' | 'voided';
  createdAt: string;
  completedAt?: string;
}

const MOCK_ENVELOPES: Map<string, MockDocuSignEnvelope> = new Map();

export async function createMockDocuSignEnvelope(
  proposalId: string,
  recipientEmail: string,
  recipientName: string,
  documentBase64: string
): Promise<MockDocuSignEnvelope> {
  const envelopeId = `docusign_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mock-docusign/${envelopeId}?email=${encodeURIComponent(recipientEmail)}`;

  const envelope: MockDocuSignEnvelope = {
    envelopeId,
    signingUrl,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  MOCK_ENVELOPES.set(envelopeId, envelope);
  console.log('[Mock DocuSign] Envelope created:', envelopeId, 'for', recipientEmail);
  
  return envelope;
}

export async function getMockEnvelopeStatus(envelopeId: string): Promise<MockDocuSignEnvelope | null> {
  return MOCK_ENVELOPES.get(envelopeId) || null;
}

export async function mockCompleteEnvelope(envelopeId: string): Promise<MockDocuSignEnvelope | null> {
  const envelope = MOCK_ENVELOPES.get(envelopeId);
  if (!envelope) return null;

  envelope.status = 'completed';
  envelope.completedAt = new Date().toISOString();
  MOCK_ENVELOPES.set(envelopeId, envelope);
  
  console.log('[Mock DocuSign] Envelope completed:', envelopeId);
  return envelope;
}

export async function mockDeclineEnvelope(envelopeId: string): Promise<MockDocuSignEnvelope | null> {
  const envelope = MOCK_ENVELOPES.get(envelopeId);
  if (!envelope) return null;

  envelope.status = 'declined';
  MOCK_ENVELOPES.set(envelopeId, envelope);
  
  console.log('[Mock DocuSign] Envelope declined:', envelopeId);
  return envelope;
}

// Simulate DocuSign webhook
export function simulateDocuSignWebhook(envelopeId: string, event: 'completed' | 'declined') {
  const envelope = MOCK_ENVELOPES.get(envelopeId);
  if (!envelope) return;

  if (event === 'completed') {
    envelope.status = 'completed';
    envelope.completedAt = new Date().toISOString();
  } else {
    envelope.status = 'declined';
  }
  MOCK_ENVELOPES.set(envelopeId, envelope);
  
  console.log('[Mock DocuSign] Webhook simulated:', event, 'for', envelopeId);
}