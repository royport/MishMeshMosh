import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WorkspaceAssignmentsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: myAssignments } = await supabase
    .from('assignments')
    .select(`
      *,
      needCampaign:campaigns!campaign_need_id(id, title),
      feedCampaign:campaigns!campaign_feed_id(id, title),
      assignmentDeed:deeds!assignment_deed_id(
        *,
        deed_signers(
          *,
          user:users(id)
        )
      )
    `)
    .or(`needCampaign.created_by.eq.${user.id},feedCampaign.created_by.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const { data: signedAssignments } = await supabase
    .from('deed_signers')
    .select(`
      *,
      deed:deeds!deed_id(
        *,
        assignments!assignment_deed_id(
          *,
          needCampaign:campaigns!campaign_need_id(id, title),
          feedCampaign:campaigns!campaign_feed_id(id, title)
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('deed.deed_kind', 'assignment_deed');

  const allAssignmentIds = new Set();
  const allAssignments: any[] = [];

  if (myAssignments) {
    myAssignments.forEach((a: any) => {
      allAssignmentIds.add(a.id);
      allAssignments.push(a);
    });
  }

  if (signedAssignments) {
    signedAssignments.forEach((s: any) => {
      if (s.deed?.assignments && !allAssignmentIds.has(s.deed.assignments.id)) {
        allAssignmentIds.add(s.deed.assignments.id);
        allAssignments.push(s.deed.assignments);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Assignments</h1>
          <p className="text-lg text-slate-600">
            View Assignment (Reed) Deeds that link suppliers with backer commitments
          </p>
        </div>

        {allAssignments.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No assignments yet
            </h3>
            <p className="text-slate-600">
              Assignments are created when a supplier is selected for a campaign
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {allAssignments.map((assignment: any) => {
              const deed = assignment.assignmentDeed;
              const signedCount = deed?.deed_signers?.filter(
                (s: any) => s.status === 'signed'
              ).length || 0;
              const totalSigners = deed?.deed_signers?.length || 0;

              return (
                <Link
                  key={assignment.id}
                  href={`/workspace/assignments/${assignment.id}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          REED
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {assignment.status.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {assignment.needCampaign?.title}
                      </h3>

                      <p className="text-sm text-slate-600">
                        Created {new Date(assignment.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Signatures</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {signedCount}/{totalSigners}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <div className="text-sm text-slate-500">Need Campaign</div>
                      <div className="font-medium text-slate-900">
                        {assignment.needCampaign?.title}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-500">Feed Campaign</div>
                      <div className="font-medium text-slate-900">
                        {assignment.feedCampaign?.title}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
