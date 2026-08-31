import { createServerSupabaseClient } from '@/lib/supabase';
import { cn, formatDate } from '@/lib/utils';
import { Search, Filter, UserPlus, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function LeadsPage() {
  const supabase = createServerSupabaseClient();

  const { data: leads } = await supabase
    .from('ghl_leads')
    .select('*')
    .order('created_at', { ascending: false });

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
              {leads?.map(lead => (
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
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}