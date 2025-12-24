import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import NeedDeedViewer from '@/components/deeds/need-deed-viewer';
import { logDeedEvent, getDeedAuditTrail } from '@/lib/deed-audit';
import { getDeedVersionHistory } from '@/lib/deed-operations';

export const dynamic = 'force-dynamic';

export default async function DeedPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const { data: deed, error } = await supabase
    .from('deeds')
    .select(`
      *,
      deed_signers(*)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error || !deed) {
    notFound();
  }

  const hasAccess = deed.created_by === user.id ||
    deed.deed_signers?.some((signer: any) => signer.user_id === user.id);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You do not have permission to view this deed.</p>
        </div>
      </div>
    );
  }

  await logDeedEvent(deed.id, 'viewed', user.id);
  const auditTrail = await getDeedAuditTrail(deed.id);
  const versionHistory = await getDeedVersionHistory(deed.id);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between no-print">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {deed.deed_kind === 'need_deed' && 'Need Deed'}
              {deed.deed_kind === 'feed_deed' && 'Feed Deed'}
              {deed.deed_kind === 'assignment_deed' && 'Assignment Deed'}
            </h1>
            <p className="text-slate-600">
              Deed ID: <span className="font-mono text-sm">{deed.id}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Print
            </button>
            <a
              href={`/api/deeds/${deed.id}/html`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View HTML
            </a>
          </div>
        </div>

        {deed.deed_kind === 'need_deed' && (
          <NeedDeedViewer deed={deed} auditTrail={auditTrail} versionHistory={versionHistory} />
        )}
      </div>
    </div>
  );
}
