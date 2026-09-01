'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText,
  Send,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Settings,
  Loader2,
  Plus,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface LeadDetailProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    project_type: string;
    budget_range: string;
    timeline: string;
    source: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  siteWalk: {
    id: string;
    transcript: string;
    photos: string[];
    scheduled_at: string;
    completed_at: string | null;
  } | null;
  proposals: {
    id: string;
    status: string;
    total: number;
    created_at: string;
    approved_at: string | null;
    sent_at: string | null;
  }[];
}

export function LeadDetail({ lead, siteWalk, proposals }: LeadDetailProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);

  async function handleGenerateProposal() {
    setGeneratingProposal(true);
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ghl_lead_id: lead.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Failed to generate proposal');
      }
    } catch (error) {
      alert('Failed to generate proposal');
    } finally {
      setGeneratingProposal(false);
    }
  }

  const statusColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-700',
    qualified: 'bg-blue-100 text-blue-700',
    site_walk_scheduled: 'bg-yellow-100 text-yellow-700',
    site_walk_done: 'bg-purple-100 text-purple-700',
    proposal_sent: 'bg-indigo-100 text-indigo-700',
    signed: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    new: 'New',
    qualified: 'Qualified',
    site_walk_scheduled: 'Walk Scheduled',
    site_walk_done: 'Walk Done',
    proposal_sent: 'Proposal Sent',
    signed: 'Signed',
    lost: 'Lost',
  };

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
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500">{lead.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[lead.status]}`}>
            {statusLabels[lead.status] || lead.status}
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
              <div>
                <dt className="text-sm text-gray-500">Timeline</dt>
                <dd className="font-medium text-gray-900">{lead.timeline || 'Not specified'}</dd>
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
                <dt className="text-sm text-gray-500">Lead Created</dt>
                <dd className="font-medium text-gray-900">{formatDate(lead.created_at)}</dd>
              </div>
              {siteWalk?.scheduled_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Site Walk Scheduled</dt>
                  <dd className="font-medium text-gray-900">{formatDate(siteWalk.scheduled_at)}</dd>
                </div>
              )}
              {siteWalk?.completed_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Site Walk Completed</dt>
                  <dd className="font-medium text-gray-900">{formatDate(siteWalk.completed_at)}</dd>
                </div>
              )}
              {proposals.length > 0 && proposals[0].created_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Proposal Created</dt>
                  <dd className="font-medium text-gray-900">{formatDate(proposals[0].created_at)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Lead Notes */}
          {lead.notes && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-400" />
                Lead Notes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Site Walk & Proposals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site Walk Transcript */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Site Walk
              </h2>
              {siteWalk && (
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showTranscript ? 'Hide' : 'Show'} Transcript
                </button>
              )}
            </div>
            {siteWalk && showTranscript && (
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
            {!siteWalk && (
              <div className="p-6 text-center text-gray-500">
                <p>No site walk scheduled for this lead.</p>
              </div>
            )}
          </div>

          {/* Proposals */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Proposals ({proposals.length})
              </h2>
              {siteWalk && !proposals.length && lead.status === 'site_walk_done' && (
                <button
                  onClick={handleGenerateProposal}
                  disabled={generatingProposal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingProposal ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Generate Proposal
                    </>
                  )}
                </button>
              )}
            </div>
            {proposals.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No proposals yet for this lead.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {proposals.map(proposal => (
                      <tr key={proposal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-mono text-sm text-gray-900">{proposal.id.slice(0, 12)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(proposal.total)}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{formatDate(proposal.created_at)}</td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/proposals/${proposal.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}