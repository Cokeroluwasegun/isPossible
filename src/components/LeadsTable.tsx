'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  project_type: string | null;
  budget_range: string | null;
  source: string;
  status: string;
  created_at: string;
}

interface LeadsTableProps {
  initialLeads: Lead[];
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

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = initialLeads.filter(lead => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.address.toLowerCase().includes(q) ||
      lead.id.toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'site_walk_scheduled', label: 'Walk Scheduled' },
    { value: 'site_walk_done', label: 'Walk Done' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'signed', label: 'Signed' },
    { value: 'lost', label: 'Lost' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Manage all incoming leads from GHL</p>
        </div>
        <Link href="/admin/leads/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <UserPlus size={18} />
          Add Lead
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
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

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filtered.length} of {initialLeads.length} leads
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{lead.id}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{lead.project_type || 'Not specified'}</div>
                      <div className="text-xs text-gray-500">{lead.address}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{lead.budget_range || 'Not specified'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-gray-700">{lead.source}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status] || statusColors.new}`}>
                        {statusLabels[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-4">
                      <Link 
                        href={`/admin/leads/${lead.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </Link>
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
