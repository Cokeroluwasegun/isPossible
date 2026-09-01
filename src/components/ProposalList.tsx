'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  ChevronRight,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Send,
  Edit,
  Eye,
  MoreVertical,
  Download,
  Trash2,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { toast } from '@/components/Toast';

interface ProposalListProps {
  initialProposals: any[];
}

export function ProposalList({ initialProposals }: ProposalListProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = !search || 
      p.ghl_leads?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.ghl_leads?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent' },
    { value: 'signed', label: 'Signed' },
  ];

  const handleAction = async (proposalId: string, action: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: proposalId, action }),
      });
      
      const data = await res.json();
      if (data.success) {
        setProposals(prev => prev.map(p => 
          p.id === proposalId ? { ...p, ...data.proposal } : p
        ));
        const actionLabels: Record<string, string> = {
          approve: 'Proposal approved',
          send: 'Proposal sent to client',
          request_changes: 'Changes requested',
        };
        toast.success(actionLabels[action] || 'Action completed');
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (proposal: any) => {
    const daysSinceCreated = (Date.now() - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (proposal.status === 'pending_review' && daysSinceCreated > 1) {
      return <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">Overdue Review</span>;
    }
    if (proposal.status === 'draft' && daysSinceCreated > 2) {
      return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">Stale Draft</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-500 mt-1">Manage and track all client proposals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: 'pending_review', label: 'Pending Review', color: 'yellow' },
          { key: 'approved', label: 'Approved', color: 'blue' },
          { key: 'sent', label: 'Sent', color: 'purple' },
          { key: 'signed', label: 'Signed', color: 'green' },
        ].map(stat => (
          <div key={stat.key} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {proposals.filter(p => p.status === stat.key).length}
            </p>
          </div>
        ))}
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No proposals found
                  </td>
                </tr>
              ) : (
                filteredProposals.map(proposal => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-mono text-sm text-gray-900">{proposal.id.slice(0, 12)}</div>
                      <div className="text-xs text-gray-500">{formatDate(proposal.created_at)}</div>
                      {getPriorityBadge(proposal)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{proposal.ghl_leads?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{proposal.ghl_leads?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{proposal.ghl_leads?.project_type || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{proposal.ghl_leads?.source}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{formatCurrency(proposal.total)}</div>
                      <div className="text-xs text-gray-500">{proposal.line_items?.length || 0} line items</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                        {getStatusLabel(proposal.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{proposal.site_walks?.completed_at ? 'Walk done' : 'Walk pending'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/proposals/${proposal.id}`)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {proposal.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleAction(proposal.id, 'approve')}
                              disabled={loading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(proposal.id, 'request_changes')}
                              disabled={loading}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Request Changes"
                            >
                              <Edit size={18} />
                            </button>
                          </>
                        )}
                        {proposal.status === 'approved' && (
                          <button
                            onClick={() => handleAction(proposal.id, 'send')}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Send to Client"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {proposal.status === 'sent' && (
                          <button
                            onClick={() => router.push(`/mock-docusign/${proposal.docusign_envelope_id}?email=${proposal.ghl_leads?.email}`)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="View DocuSign"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}