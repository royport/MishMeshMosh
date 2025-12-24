import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DemoDataSeeder } from '@/components/admin/demo-data-seeder';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient();

  // Get platform stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  const { count: liveCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status_need', 'live');

  const { count: totalDeeds } = await supabase
    .from('deeds')
    .select('*', { count: 'exact', head: true });

  const { count: openDisputes } = await supabase
    .from('disputes')
    .select('*', { count: 'exact', head: true })
    .in('status', ['open', 'in_review']);

  const { count: pendingReview } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status_need', 'review');

  // Get recent activity
  const { data: recentCampaigns } = await supabase
    .from('campaigns')
    .select('id, title, kind, status_need, status_feed, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentDisputes } = await supabase
    .from('disputes')
    .select('id, context_type, status, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Campaigns', value: totalCampaigns || 0, icon: '📋', color: 'bg-green-500' },
    { label: 'Live Campaigns', value: liveCampaigns || 0, icon: '🟢', color: 'bg-emerald-500' },
    { label: 'Total Deeds', value: totalDeeds || 0, icon: '📜', color: 'bg-purple-500' },
    { label: 'Open Disputes', value: openDisputes || 0, icon: '⚠️', color: 'bg-red-500' },
    { label: 'Pending Review', value: pendingReview || 0, icon: '👁️', color: 'bg-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/campaigns"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Campaign Moderation</h3>
              <p className="text-sm text-slate-600">Review and manage campaigns</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/disputes"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
              ⚖️
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Dispute Resolution</h3>
              <p className="text-sm text-slate-600">Handle user disputes</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">User Management</h3>
              <p className="text-sm text-slate-600">Manage users and permissions</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Campaigns</h2>
            <Link href="/admin/campaigns" className="text-sm text-primary-600 font-medium hover:text-primary-700">
              View All →
            </Link>
          </div>
          {recentCampaigns && recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {recentCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{campaign.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    campaign.status_need === 'live' ? 'bg-green-100 text-green-700' :
                    campaign.status_need === 'review' ? 'bg-amber-100 text-amber-700' :
                    campaign.status_need === 'draft' ? 'bg-slate-100 text-slate-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {campaign.status_need || campaign.status_feed}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No campaigns yet</p>
          )}
        </div>

        {/* Recent Disputes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Disputes</h2>
            <Link href="/admin/disputes" className="text-sm text-primary-600 font-medium hover:text-primary-700">
              View All →
            </Link>
          </div>
          {recentDisputes && recentDisputes.length > 0 ? (
            <div className="space-y-3">
              {recentDisputes.map((dispute: any) => (
                <div key={dispute.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 text-sm capitalize">
                      {dispute.context_type} Dispute
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {dispute.reason.substring(0, 50)}...
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    dispute.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    dispute.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                    dispute.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {dispute.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No disputes filed</p>
          )}
        </div>
      </div>

      {/* Demo Data Seeder */}
      <div className="mt-8">
        <DemoDataSeeder />
      </div>
    </div>
  );
}
