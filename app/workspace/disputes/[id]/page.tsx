import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface DisputePageProps {
  params: Promise<{ id: string }>;
}

export default async function DisputePage({ params }: DisputePageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const { data: dispute, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !dispute) {
    notFound();
  }

  // Check access
  if (dispute.opened_by !== user.id) {
    const { data: permission } = await supabase
      .from('platform_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['admin', 'moderator'])
      .single();

    if (!permission) {
      notFound();
    }
  }

  // Get context info
  let contextInfo: any = null;
  let contextLink = '';

  if (dispute.context_type === 'deed') {
    const { data } = await supabase
      .from('deeds')
      .select('id, deed_kind, status, campaign_id')
      .eq('id', dispute.context_id)
      .single();
    contextInfo = data;
    if (data) {
      contextLink = `/workspace/deeds/${data.id}`;
    }
  } else if (dispute.context_type === 'campaign') {
    const { data } = await supabase
      .from('campaigns')
      .select('id, title, kind, status_need, status_feed')
      .eq('id', dispute.context_id)
      .single();
    contextInfo = data;
    if (data) {
      contextLink = data.kind === 'need' ? `/campaign/${data.id}` : `/feed/${data.id}`;
    }
  } else if (dispute.context_type === 'assignment') {
    const { data } = await supabase
      .from('assignments')
      .select('id, status')
      .eq('id', dispute.context_id)
      .single();
    contextInfo = data;
    if (data) {
      contextLink = `/workspace/assignments/${data.id}`;
    }
  }

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
    <div className="max-w-3xl mx-auto">
      <Link
        href="/workspace/disputes"
        className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Disputes
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Dispute Details</h1>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  dispute.status
                )}`}
              >
                {dispute.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-slate-500">
                Filed {new Date(dispute.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Context Info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Regarding</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 capitalize">
                {dispute.context_type}
                {contextInfo?.title && `: ${contextInfo.title}`}
                {contextInfo?.deed_kind && `: ${contextInfo.deed_kind.replace('_', ' ')}`}
              </p>
              <p className="text-sm text-slate-600">ID: {dispute.context_id}</p>
            </div>
            {contextLink && (
              <Link
                href={contextLink}
                className="text-primary-600 font-medium text-sm hover:text-primary-700"
              >
                View {dispute.context_type}
              </Link>
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Reason for Dispute</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-slate-900 whitespace-pre-wrap">{dispute.reason}</p>
          </div>
        </div>

        {/* Resolution */}
        {dispute.resolution_json && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800 mb-2">Resolution</h3>
            <p className="text-green-900">
              {dispute.resolution_json.notes || 'This dispute has been resolved.'}
            </p>
            {dispute.closed_at && (
              <p className="text-sm text-green-700 mt-2">
                Closed on {new Date(dispute.closed_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-yellow-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Dispute Opened</p>
                <p className="text-xs text-slate-500">
                  {new Date(dispute.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {dispute.status === 'in_review' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Under Review</p>
                  <p className="text-xs text-slate-500">Being reviewed by the platform team</p>
                </div>
              </div>
            )}

            {dispute.closed_at && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {dispute.status === 'resolved' ? 'Resolved' : 'Closed'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(dispute.closed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
