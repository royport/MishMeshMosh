import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'Your MishMeshMosh workspace dashboard',
};

export const dynamic = 'force-dynamic';

export default async function WorkspacePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-2 text-neutral-600">
            Here&apos;s an overview of your activity on MishMeshMosh
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-neutral-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-3xl">📋</div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-600 truncate">
                      My Campaigns
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-neutral-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <Link
                href="/workspace/campaigns"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View campaigns
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-neutral-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-3xl">📜</div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-600 truncate">My Deeds</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-neutral-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <Link
                href="/workspace/deeds"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View deeds
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-neutral-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-3xl">👥</div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-600 truncate">My Groups</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-neutral-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <span className="text-sm font-medium text-neutral-400">Coming soon</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow-sm rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/create"
                className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">➕</span>
                  <div>
                    <p className="font-medium text-neutral-900">Create Need Campaign</p>
                    <p className="text-sm text-neutral-600">
                      Start gathering demand for a product or service
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link
                href="/explore"
                className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🔍</span>
                  <div>
                    <p className="font-medium text-neutral-900">Browse Campaigns</p>
                    <p className="text-sm text-neutral-600">
                      Find and join active campaigns
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-neutral-600">No recent activity yet</p>
              <p className="text-sm text-neutral-500 mt-2">
                Your activity will appear here once you create or join campaigns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
