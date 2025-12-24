import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'My Deeds',
  description: 'View and manage your deeds on MishMeshMosh',
};

export const dynamic = 'force-dynamic';

export default async function MyDeedsPage() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const { data: deeds, error } = await supabase
    .from('deeds')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const needDeeds = deeds?.filter((d: any) => d.deed_kind === 'need_deed') || [];
  const feedDeeds = deeds?.filter((d: any) => d.deed_kind === 'feed_deed') || [];
  const reedDeeds = deeds?.filter((d: any) => d.deed_kind === 'assignment_deed') || [];

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Deeds</h1>
          <p className="mt-2 text-slate-600">
            View all deeds you&apos;ve signed across campaigns
          </p>
        </div>

        {deeds && deeds.length > 0 ? (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {deeds.map((deed: any) => (
                  <Link
                    key={deed.id}
                    href={`/workspace/deeds/${deed.id}`}
                    className="block border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {deed.deed_kind === 'need_deed' && '📝'}
                            {deed.deed_kind === 'feed_deed' && '🎯'}
                            {deed.deed_kind === 'assignment_deed' && '🤝'}
                          </span>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {deed.deed_kind === 'need_deed' && 'Need Deed'}
                              {deed.deed_kind === 'feed_deed' && 'Feed Deed'}
                              {deed.deed_kind === 'assignment_deed' && 'Assignment Deed'}
                            </h3>
                            <p className="text-sm text-slate-500 font-mono">{deed.id}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">
                          Campaign: {deed.doc_json?.campaign?.title || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mb-2">
                          {deed.status}
                        </span>
                        <p className="text-xs text-slate-500">
                          {new Date(deed.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-slate-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No deeds yet</h3>
                <p className="text-slate-600 mb-6">
                  You haven&apos;t signed any deeds yet. Join a campaign to create your first deed.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Explore Campaigns
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Need Deeds</h2>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{needDeeds.length}</p>
              <p className="text-sm text-slate-600">Your commitments as a backer</p>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Feed Deeds</h2>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{feedDeeds.length}</p>
              <p className="text-sm text-slate-600">Your offers as a supplier</p>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Reed Deeds</h2>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{reedDeeds.length}</p>
              <p className="text-sm text-slate-600">Your assignment agreements</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-primary-50 rounded-lg border border-primary-200 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-900">About Deeds</h3>
              <div className="mt-2 text-sm text-primary-700">
                <p>
                  Deeds are legally-binding digital documents that capture commitments at every
                  stage of the MishMeshMosh lifecycle. They create trust and clarity without
                  requiring payment custody.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
