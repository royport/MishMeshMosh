import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DisputesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: disputes } = await supabase
    .from('disputes')
    .select('*')
    .eq('opened_by', user.id)
    .order('created_at', { ascending: false });

  function getStatusColor(status: string) {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_review':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Disputes</h1>
        <p className="text-slate-600 mt-1">
          Track and manage disputes you&apos;ve filed
        </p>
      </div>

      {!disputes || disputes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No disputes</h3>
          <p className="text-slate-600">
            You haven&apos;t filed any disputes. Hopefully it stays that way!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        dispute.status
                      )}`}
                    >
                      {dispute.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-500 capitalize">
                      {dispute.context_type} Issue
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Filed {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/workspace/disputes/${dispute.id}`}
                  className="text-primary-600 font-medium text-sm hover:text-primary-700"
                >
                  View Details
                </Link>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-1">Reason</h4>
                <p className="text-slate-900 text-sm line-clamp-3">{dispute.reason}</p>
              </div>

              {dispute.resolution_json && (
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-700 mb-1">Resolution</h4>
                  <p className="text-green-900 text-sm">
                    {dispute.resolution_json.notes || 'Issue resolved'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
