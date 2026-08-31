'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, FileText, Pen, Download, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface MockProposalData {
  id: string;
  total: number;
  line_items: any[];
  ghl_leads: {
    name: string;
    email: string;
    address: string;
    project_type: string;
  };
  created_at: string;
}

function MockDocuSignContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const envelopeId = params.envelopeId as string;
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'sent' | 'completed' | 'declined'>('loading');
  const [proposal, setProposal] = useState<MockProposalData | null>(null);

  useEffect(() => {
    // Fetch proposal data from localStorage or simulate
    const timer = setTimeout(() => {
      setStatus('sent');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSign = () => {
    setStatus('completed');
  };

  const handleDecline = () => {
    setStatus('declined');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl border shadow-sm p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl border border-b-0 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Greenscape Pro - Proposal Document</h1>
              <p className="text-sm text-gray-500">Envelope: {envelopeId?.slice(0, 30)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'completed' ? 'bg-green-100 text-green-700' :
              status === 'declined' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {status === 'completed' ? 'Completed' : status === 'declined' ? 'Declined' : 'Pending Signature'}
            </span>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white border shadow-sm rounded-b-xl overflow-hidden">
          <div className="p-8 max-w-3xl mx-auto">
            {/* Proposal Header */}
            <div className="mb-8 pb-8 border-b">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Project Proposal</h2>
                  <p className="text-gray-500 mt-1">Greenscape Pro - Premium Outdoor Living</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date: {formatDate(proposal?.created_at || new Date().toISOString())}</p>
                  <p className="text-sm text-gray-500">Proposal: {proposal?.id || 'N/A'}</p>
                </div>
              </div>

              {/* Client Info */}
              {proposal && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Prepared For</p>
                    <p className="font-medium text-gray-900">{proposal.ghl_leads.name}</p>
                    <p className="text-sm text-gray-500">{proposal.ghl_leads.email}</p>
                    <p className="text-sm text-gray-500">{proposal.ghl_leads.address}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Project Type</p>
                    <p className="font-medium text-gray-900">{proposal.ghl_leads.project_type}</p>
                    <p className="text-sm text-gray-500 mt-2">Total: <span className="font-bold text-gray-900">{formatCurrency(proposal.total)}</span></p>
                    <p className="text-sm text-gray-500">Deposit (50%): <span className="font-bold text-gray-900">{formatCurrency(proposal.total * 0.5)}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Scope of Work */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Pen className="h-5 w-5" />
                Scope of Work
              </h3>
              <div className="space-y-3">
                {proposal?.line_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name || 'Line Item'}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                      {item.notes && <p className="text-xs text-gray-400 italic">{item.notes}</p>}
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            {proposal && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(proposal.total - proposal.total * 0.086 / 1.086)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax (8.6%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(proposal.total * 0.086 / 1.086)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(proposal.total)}</span>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="mb-8 text-sm text-gray-600 space-y-2">
              <p><strong>Terms & Conditions:</strong></p>
              <p>• 50% deposit due upon signing, balance due at project completion</p>
              <p>• Project timeline: 2-6 weeks depending on scope and weather</p>
              <p>• HOA approvals and permits are client responsibility (Greenscape Pro assists)</p>
              <p>• Changes after signing may incur additional costs</p>
              <p>• All work guaranteed for 1 year from completion</p>
            </div>

            {/* Signature Area */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Authorization</h3>
              
              {status === 'sent' && (
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <AlertCircle className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <p className="text-blue-800 font-medium">Action Required</p>
                    <p className="text-blue-700 mt-1">Review the proposal above and sign below to authorize the project.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Client Signature</p>
                      <div className="h-16 border-b border-gray-400 mx-auto max-w-xs mt-4" />
                      <p className="text-xs text-gray-400 mt-2">{proposal?.ghl_leads.name}</p>
                    </div>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Greenscape Pro</p>
                      <div className="h-16 border-b border-gray-400 mx-auto max-w-xs mt-4" />
                      <p className="text-xs text-gray-400 mt-2">Marcus Tate, CEO</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSign}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Sign & Approve
                    </button>
                    <button
                      onClick={handleDecline}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Document Signed!</h3>
                  <p className="text-gray-500 mt-2">Thank you for choosing Greenscape Pro. We'll be in touch soon to schedule your project.</p>
                  <p className="text-sm text-gray-400 mt-4">Signed on {formatDate(new Date().toISOString())}</p>
                </div>
              )}

              {status === 'declined' && (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Document Declined</h3>
                  <p className="text-gray-500 mt-2">The proposal was declined. Please contact Greenscape Pro if you have questions.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a mock DocuSign envelope for development purposes.</p>
        </div>
      </div>
    </div>
  );
}

export default function MockDocuSign() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
      <MockDocuSignContent />
    </Suspense>
  );
}