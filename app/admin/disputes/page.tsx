import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DisputeResolutionActions } from '@/components/admin/dispute-resolution-actions';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
}

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const status = searchParams.status || 'open';

  let query = supabase
    .from('disputes')
    .select(`
      *,
      opener:users!opened_by (id, email, full_name)
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: disputes } = await query;

  const statusFilters = [
    { value: 'open', label: 'Open', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'in_review', label: 'In Review', color: 'bg-blue-100 text-blue-700' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-700' },
    { value: 'closed', label: 'Closed', color: 'bg-slate-100 text-slate-700' },
    { value: 'all', label: 'All', color: 'bg-slate-100 text-slate-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dispute Resolution</h1>
        <p className="text-slate-600 mt-1">Review and resolve user disputes</p>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Filter:</span>
          {statusFilters.map((filter) => (
            <Link
              key={filter.value}
              href={`/admin/disputes?status=${filter.value}`}
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

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes && disputes.length > 0 ? (
          disputes.map((dispute: any) => (
            <div
              key={dispute.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      dispute.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                      dispute.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                      dispute.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {dispute.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-500 capitalize">
                      {dispute.context_type} Dispute
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Filed by <span className="font-medium text-slate-900">
                      {dispute.opener?.full_name || dispute.opener?.email}
                    </span> on {new Date(dispute.created_at).toLocaleString()}
                  </p>
                </div>

                <DisputeResolutionActions dispute={dispute} />
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-1">Reason</h4>
                <p className="text-slate-900">{dispute.reason}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">Context ID:</span>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                  {dispute.context_id}
                </code>
              </div>

              {dispute.resolution_json && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-1">Resolution</h4>
                  <p className="text-green-900 text-sm">
                    {dispute.resolution_json.notes || 'Resolved'}
                  </p>
                  {dispute.resolution_json.resolved_by && (
                    <p className="text-xs text-green-700 mt-2">
                      Resolved by: {dispute.resolution_json.resolved_by}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No disputes</h3>
            <p className="text-slate-600">No disputes matching the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
