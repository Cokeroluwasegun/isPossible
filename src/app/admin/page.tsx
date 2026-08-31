import { ProposalList } from '@/components/ProposalList';
import { createServerSupabaseClient } from '@/lib/supabase';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}) => (
  <div className="bg-white rounded-lg border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient();

  // Fetch stats
  const [
    { count: totalProposals },
    { count: pendingReview },
    { count: approvedCount },
    { count: sentCount },
    { count: signedCount },
    { data: recentProposals },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from('proposals').select('*', { count: 'exact', head: true }),
    supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('status', 'signed'),
    supabase.from('proposals').select(`
      *,
      ghl_leads:ghl_lead_id (id, name, email, project_type),
      site_walks:site_walk_id (id, completed_at)
    `).order('created_at', { ascending: false }).limit(5),
    supabase.from('ghl_leads').select('*', { count: 'exact', head: true }),
  ]);

  const leads = totalLeads || 0;

  const totalRevenueResult = await supabase
    .from('proposals')
    .select('total')
    .eq('status', 'signed');

  const totalRevenue = totalRevenueResult.data?.reduce((sum, p) => sum + Number(p.total), 0) || 0;

  const pipelineRevenueResult = await supabase
    .from('proposals')
    .select('total')
    .in('status', ['approved', 'sent']);

  const pipelineRevenue = pipelineRevenueResult.data?.reduce((sum, p) => sum + Number(p.total), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your proposal pipeline</p>
        </div>
        <Link
          href="/admin/proposals"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FileText size={18} />
          View All Proposals
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Proposals"
          value={totalProposals || 0}
          icon={FileText}
          color="bg-blue-100"
        />
        <StatCard
          title="Pending Review"
          value={pendingReview || 0}
          icon={Clock}
          color="bg-yellow-100"
          trend={pendingReview && pendingReview > 0 ? '⚠ Needs attention' : 'All caught up'}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(pipelineRevenue)}
          icon={DollarSign}
          color="bg-purple-100"
        />
        <StatCard
          title="Closed Revenue"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          color="bg-green-100"
        />
      </div>

      {/* Quick Actions & Recent Proposals */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/proposals?status=pending_review"
                className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Pending Proposals</p>
                    <p className="text-sm text-gray-500">{pendingReview || 0} awaiting your approval</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/proposals?status=approved"
                className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Send Approved Proposals</p>
                    <p className="text-sm text-gray-500">{approvedCount || 0} ready to send</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/leads"
                className="block p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Leads</p>
                    <p className="text-sm text-gray-500">{leads || 0} total leads in system</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/pricing"
                className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pricing Catalog</p>
                    <p className="text-sm text-gray-500">Manage line items & markup</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
            <div className="space-y-4">
              {[
                { label: 'Leads in System', value: leads || 0, color: 'bg-gray-200' },
                { label: 'Site Walks Done', value: recentProposals?.filter(p => p.site_walks?.completed_at).length || 0, color: 'bg-blue-200' },
                { label: 'Proposals Generated', value: totalProposals || 0, color: 'bg-yellow-200' },
                { label: 'Sent to Client', value: sentCount || 0, color: 'bg-purple-200' },
                { label: 'Signed', value: signedCount || 0, color: 'bg-green-200' },
              ].map((stage, i) => (
                <div key={stage.label} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{stage.label}</span>
                    <span className="font-medium text-gray-900">{stage.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} rounded-full transition-all`}
                      style={{ width: `${leads ? (stage.value / leads) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="lg:col-span-2">
          <ProposalList initialProposals={recentProposals || []} />
        </div>
      </div>
    </div>
  );
}