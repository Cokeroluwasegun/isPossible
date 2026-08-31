'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const amount = searchParams.get('amount');
  const proposal = searchParams.get('proposal');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const amountDollars = amount ? formatCurrency(parseInt(amount) / 100) : '$0.00';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mock Stripe Checkout</h1>
          <p className="text-gray-500 mt-1">Development mode - no real charges</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Proposal</span>
            <span className="font-mono text-sm text-gray-900">{proposal || 'N/A'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Deposit Amount (50%)</span>
            <span className="font-bold text-gray-900 text-lg">{amountDollars}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Session ID</span>
            <span className="font-mono">{sessionId?.slice(0, 20)}...</span>
          </div>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-600">Processing payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">Deposit of {amountDollars} has been processed.</p>
            <p className="text-sm text-gray-400 mt-1">Session: {sessionId}</p>
            <div className="mt-6 space-y-2">
              <Link 
                href={`/admin/proposals/${proposal}`}
                className="block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Return to Proposal
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 mt-2">Something went wrong. Please try again.</p>
            <button 
              onClick={() => setStatus('loading')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>Development Mode:</strong> This is a mock Stripe checkout. No real payment is processed. 
          In production, this would redirect to Stripe's hosted checkout page.
        </div>
      </div>
    </div>
  );
}

export default function MockCheckout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
      <MockCheckoutContent />
    </Suspense>
  );
}