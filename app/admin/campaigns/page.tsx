import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CampaignModerationActions } from '@/components/admin/campaign-moderation-actions';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  page?: string;
}

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const status = params.status || 'all';
  const page = parseInt(params.page || '1');
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('campaigns')
    .select(`
      *,
      creator:users!created_by (id, email, full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (status !== 'all') {
    query = query.or(`status_need.eq.${status},status_feed.eq.${status}`);
  }

  const { data: campaigns, count } = await query;

  const totalPages = Math.ceil((count || 0) / perPage);

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Pending Review' },
    { value: 'live', label: 'Live' },
    { value: 'seeded', label: 'Seeded' },
    { value: 'canceled', label: 'Canceled' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Campaign Moderation</h1>
        <p className="text-slate-600 mt-1">Review and manage all campaigns</p>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Filter:</span>
          {statusFilters.map((filter) => (
            <Link
              key={filter.value}
              href={`/admin/campaigns?status=${filter.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === filter.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign: any) => (
                  <tr key={campaign.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={campaign.kind === 'need' ? `/campaign/${campaign.id}` : `/feed/${campaign.id}`}
                        className="font-medium text-slate-900 hover:text-primary-600"
                      >
                        {campaign.title}
                      </Link>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {campaign.description?.substring(0, 60)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">
                        {campaign.creator?.full_name || campaign.creator?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500">{campaign.creator?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        campaign.kind === 'need' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {campaign.kind.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (campaign.status_need || campaign.status_feed) === 'live' ? 'bg-green-100 text-green-700' :
                        (campaign.status_need || campaign.status_feed) === 'review' ? 'bg-amber-100 text-amber-700' :
                        (campaign.status_need || campaign.status_feed) === 'draft' ? 'bg-slate-100 text-slate-700' :
                        (campaign.status_need || campaign.status_feed) === 'seeded' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {campaign.status_need || campaign.status_feed}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        campaign.visibility === 'public' ? 'bg-green-100 text-green-700' :
                        campaign.visibility === 'private' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {campaign.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CampaignModerationActions campaign={campaign} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {offset + 1} to {Math.min(offset + perPage, count || 0)} of {count} campaigns
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/campaigns?status=${status}&page=${page - 1}`}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/campaigns?status=${status}&page=${page + 1}`}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
