'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Send,
  Edit,
  Download,
  Eye,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  Settings,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface ProposalDetailData {
  id: string;
  ghl_lead_id: string;
  site_walk_id: string;
  line_items: any[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  marcus_notes: string | null;
  stripe_session_id: string | null;
  docusign_envelope_id: string | null;
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
  ghl_leads: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    project_type: string;
    budget_range: string;
    source: string;
    notes: string | null;
  };
  site_walks: {
    id: string;
    transcript: string;
    photos: string[];
    scheduled_at: string;
    completed_at: string | null;
  } | null;
}

export function ProposalDetail() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<ProposalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  async function fetchProposal() {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`);
      const data = await res.json();
      if (data.proposal) {
        setProposal(data.proposal);
      }
    } catch (error) {
      console.error('Failed to fetch proposal:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    setActionLoading(action);
    try {
      const res = await fetch('/api/proposals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: proposalId, action }),
      });
      
      const data = await res.json();
      if (data.success) {
        setProposal(prev => prev ? { ...prev, ...data.proposal } : null);
        if (action === 'send' && data.deposit_url) {
          window.open(data.deposit_url, '_blank');
        }
        if (action === 'send' && data.docusign_url) {
          window.open(data.docusign_url, '_blank');
        }
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      alert('Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Proposal not found</h2>
        <Link href="/admin" className="text-blue-600 hover:underline mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  const lead = proposal.ghl_leads;
  const siteWalk = proposal.site_walks;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposal Details</h1>
          <p className="text-gray-500">{proposal.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(proposal.status)}`}>
            {getStatusLabel(proposal.status)}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Client & Project Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client Card */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              Client Information
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">{lead.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{lead.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{lead.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Address</dt>
                <dd className="font-medium text-gray-900">{lead.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Source</dt>
                <dd className="font-medium text-gray-900 capitalize">{lead.source}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Budget Range</dt>
                <dd className="font-medium text-gray-900">{lead.budget_range || 'Not specified'}</dd>
              </div>
            </dl>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-400" />
              Project Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Project Type</dt>
                <dd className="font-medium text-gray-900">{lead.project_type || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Proposal Total</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(proposal.total)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Subtotal</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(proposal.subtotal)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Tax (8.6%)</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(proposal.tax)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Line Items</dt>
                <dd className="font-medium text-gray-900">{proposal.line_items?.length || 0}</dd>
              </div>
            </dl>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              Timeline
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">{formatDate(proposal.created_at)}</dd>
              </div>
              {proposal.approved_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Approved</dt>
                  <dd className="font-medium text-gray-900">{formatDate(proposal.approved_at)}</dd>
                </div>
              )}
              {proposal.sent_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Sent to Client</dt>
                  <dd className="font-medium text-gray-900">{formatDate(proposal.sent_at)}</dd>
                </div>
              )}
              {siteWalk?.completed_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Site Walk</dt>
                  <dd className="font-medium text-gray-900">{formatDate(siteWalk.completed_at)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Marcus Notes */}
          {proposal.marcus_notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Marcus Notes
              </h3>
              <p className="text-sm text-yellow-700">{proposal.marcus_notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Line Items & Transcript */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                Line Items ({proposal.line_items?.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proposal.line_items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name || item.pricing_item_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.total_price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-8">
              <div>
                <dt className="text-sm text-gray-500">Subtotal</dt>
                <dd className="font-semibold text-gray-900">{formatCurrency(proposal.subtotal)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Tax</dt>
                <dd className="font-semibold text-gray-900">{formatCurrency(proposal.tax)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Total</dt>
                <dd className="text-xl font-bold text-gray-900">{formatCurrency(proposal.total)}</dd>
              </div>
            </div>
          </div>

          {/* Site Walk Transcript */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Site Walk Transcript
              </h2>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </button>
            </div>
            {showTranscript && siteWalk && (
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Scheduled: {formatDate(siteWalk.scheduled_at)}</p>
                  {siteWalk.completed_at && (
                    <p className="text-sm text-gray-500">Completed: {formatDate(siteWalk.completed_at)}</p>
                  )}
                  <p className="text-sm text-gray-500">{siteWalk.photos.length} photos</p>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed max-h-96 overflow-auto">
{siteWalk.transcript}
                </pre>
              </div>
            )}
          </div>

          {/* Client Notes */}
          {lead.notes && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-400" />
                Lead Notes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border p-6 flex flex-wrap gap-3">
            {proposal.status === 'draft' && (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading === 'approve'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Approve & Move to Review
                </button>
              </>
            )}
            {proposal.status === 'pending_review' && (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading === 'approve'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
                <button
                  onClick={() => handleAction('request_changes')}
                  disabled={actionLoading === 'request_changes'}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Request Changes
                </button>
              </>
            )}
            {proposal.status === 'approved' && (
              <button
                onClick={() => handleAction('send')}
                disabled={actionLoading === 'send'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={18} />
                Send to Client
              </button>
            )}
            {proposal.status === 'sent' && proposal.docusign_envelope_id && (
              <a
                href={`/mock-docusign/${proposal.docusign_envelope_id}?email=${lead.email}`}
                target="_blank"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Eye size={18} />
                View DocuSign
              </a>
            )}
            {proposal.status === 'sent' && proposal.stripe_session_id && (
              <a
                href={`/mock-checkout?session_id=${proposal.stripe_session_id}`}
                target="_blank"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition flex items-center gap-2"
              >
                <DollarSign size={18} />
                View Deposit Link
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}