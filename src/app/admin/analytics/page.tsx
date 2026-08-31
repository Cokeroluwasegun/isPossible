import { createServerSupabaseClient } from '@/lib/supabase';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, DollarSign, Users, Clock, Target, AlertCircle } from 'lucide-react';

interface ProposalData {
  id: string;
  total: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
  signed_at: string | null;
}

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient();

  const [
    { data: proposals },
    { count: totalLeads },
    { data: signedProposals },
  ] = await Promise.all([
    supabase.from('proposals').select('id, total, status, created_at, approved_at, sent_at, signed_at'),
    supabase.from('ghl_leads').select('*', { count: 'exact', head: true }),
    supabase.from('proposals').select('id, total, created_at, approved_at, sent_at, signed_at').eq('status', 'signed'),
  ]);

  const leadsCount = totalLeads || 0;
  const proposalsData = proposals || [];
  const signedData = signedProposals || [];

  const totalRevenue = signedData.reduce((sum, p) => sum + Number(p.total), 0);
  const avgDealSize = signedData.length > 0 
    ? totalRevenue / signedData.length 
    : 0;
  
  const conversionRate = leadsCount > 0 && proposalsData.length > 0
    ? (proposalsData.filter(p => p.status === 'signed').length / leadsCount) * 100 
    : 0;

  const avgTimeToApprove = proposalsData.filter((p: ProposalData) => p.approved_at).reduce((sum, p) => {
    return sum + (new Date(p.approved_at!).getTime() - new Date(p.created_at).getTime());
  }, 0) / (proposalsData.filter((p: ProposalData) => p.approved_at).length || 1);

  const avgTimeToSend = proposalsData.filter((p: ProposalData) => p.sent_at).reduce((sum, p) => {
    return sum + (new Date(p.sent_at!).getTime() - new Date(p.approved_at || p.created_at).getTime());
  }, 0) / (proposalsData.filter((p: ProposalData) => p.sent_at).length || 1);

  const msToDays = (ms: number) => Math.round(ms / (1000 * 60 * 60 * 24) * 10) / 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Pipeline performance and conversion metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue (Signed)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Deal Size</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(avgDealSize)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lead to Close Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalLeads || 0}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Timing Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Proposal Timeline (Average Days)
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Created → Approved</p>
                <p className="font-medium text-gray-900">{msToDays(avgTimeToApprove)} days</p>
              </div>
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Approved → Sent</p>
                <p className="font-medium text-gray-900">{msToDays(avgTimeToSend)} days</p>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Target: Created → Sent</p>
                <p className="font-medium text-gray-900">1-2 days (goal)</p>
              </div>
              <Target className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            Pipeline Status Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { status: 'Draft', count: proposals?.filter(p => p.status === 'draft').length || 0, color: 'bg-gray-200' },
              { status: 'Pending Review', count: proposals?.filter(p => p.status === 'pending_review').length || 0, color: 'bg-yellow-200' },
              { status: 'Approved', count: proposals?.filter(p => p.status === 'approved').length || 0, color: 'bg-blue-200' },
              { status: 'Sent', count: proposals?.filter(p => p.status === 'sent').length || 0, color: 'bg-purple-200' },
              { status: 'Signed', count: proposals?.filter(p => p.status === 'signed').length || 0, color: 'bg-green-200' },
            ].map(stage => (
              <div key={stage.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stage.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${proposals ? (stage.count / proposals.length) * 100 : 0}%` }} />
                  </div>
                  <span className="font-medium text-gray-900 w-12 text-right">{stage.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Signed Proposals</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {signedProposals?.slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{p.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">-</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(p.total)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.signed_at || p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}