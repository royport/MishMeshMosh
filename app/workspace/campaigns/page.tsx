import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Campaigns',
  description: 'Manage your campaigns on MishMeshMosh',
};

export const dynamic = 'force-dynamic';

export default async function MyCampaignsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      need_campaigns(*)
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const draftCampaigns = campaigns?.filter((c: any) => c.status_need === 'draft') || [];
  const liveCampaigns = campaigns?.filter((c: any) => c.status_need === 'live') || [];

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Campaigns</h1>
            <p className="mt-2 text-neutral-600">
              Manage campaigns you&apos;ve created or are participating in
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Campaign
          </Link>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-8">
            {liveCampaigns.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Live Campaigns ({liveCampaigns.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {liveCampaigns.map((campaign: any) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      className="bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center rounded-full bg-success-100 px-3 py-1 text-xs font-medium text-success-700">
                          Live
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {campaign.title}
                      </h3>

                      {campaign.description && (
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">
                          {campaign.visibility === 'public' ? 'Public' : campaign.visibility === 'unlisted' ? 'Unlisted' : 'Private'}
                        </span>
                        <span className="text-primary-600 font-medium">View →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {draftCampaigns.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Drafts ({draftCampaigns.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {draftCampaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                          Draft
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(campaign.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {campaign.title || 'Untitled Campaign'}
                      </h3>

                      {campaign.description && (
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/create?draft=${campaign.id}`}
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
                        >
                          Continue Editing
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
            <div className="px-4 py-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No campaigns yet</h3>
              <p className="text-neutral-600 mb-6">
                You haven&apos;t created any campaigns yet. Start by creating your first Need campaign.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700"
              >
                Create Your First Campaign
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
