import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/ui/app-header';

export const metadata: Metadata = {
  title: 'Explore Campaigns',
  description: 'Discover and join active campaigns on MishMeshMosh',
};

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Get user's group memberships
  let userGroupIds: string[] = [];
  if (user) {
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);
    
    userGroupIds = memberships?.map(m => m.group_id) || [];

    // Also get owned groups
    const { data: ownedGroups } = await supabase
      .from('groups')
      .select('id')
      .eq('owner_id', user.id);
    
    const ownedGroupIds = ownedGroups?.map(g => g.id) || [];
    userGroupIds = [...new Set([...userGroupIds, ...ownedGroupIds])];
  }

  // Fetch public + unlisted + private campaigns user has access to
  let query = supabase
    .from('campaigns')
    .select(`
      *,
      need_campaigns(*),
      groups(id, name)
    `)
    .eq('kind', 'need')
    .eq('status_need', 'live')
    .order('created_at', { ascending: false });

  // For non-logged in users, only show public campaigns
  if (!user) {
    query = query.eq('visibility', 'public');
  }

  const { data: campaigns } = await query;

  // Filter campaigns client-side for more complex logic
  const visibleCampaigns = (campaigns || []).filter((campaign: any) => {
    // Public campaigns are visible to everyone
    if (campaign.visibility === 'public') return true;
    
    // Unlisted campaigns are visible to everyone (they just don't appear in search)
    if (campaign.visibility === 'unlisted') return true;
    
    // Private campaigns require group membership
    if (campaign.visibility === 'private') {
      if (!user) return false;
      // Creator can always see their campaigns
      if (campaign.created_by === user.id) return true;
      // Check group membership
      if (campaign.group_id && userGroupIds.includes(campaign.group_id)) return true;
      return false;
    }
    
    return true;
  });

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-neutral-50">
        <div className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900">Explore Campaigns</h1>
              <p className="mt-2 text-neutral-600">
                Discover active campaigns and join collective buying opportunities
              </p>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="search"
                  placeholder="Search campaigns..."
                  className="block w-full rounded-md border border-neutral-300 px-4 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {visibleCampaigns && visibleCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleCampaigns.map((campaign: any) => (
                  <Link
                    key={campaign.id}
                    href={`/campaign/${campaign.id}`}
                    className="bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-success-100 px-3 py-1 text-xs font-medium text-success-700">
                            Live
                          </span>
                          {campaign.visibility === 'private' && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              🔒 Private
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                        {campaign.title}
                      </h3>

                      {campaign.groups && (
                        <p className="text-xs text-purple-600 font-medium mb-2">
                          👥 {campaign.groups.name}
                        </p>
                      )}

                      {campaign.description && (
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                          {campaign.description}
                        </p>
                      )}

                      {campaign.need_campaigns && campaign.need_campaigns.length > 0 && (
                        <div className="border-t border-neutral-200 pt-4">
                          <div className="grid grid-cols-2 gap-3">
                            {campaign.need_campaigns[0].threshold_qty && (
                              <div>
                                <p className="text-xs text-neutral-600">Target Backers</p>
                                <p className="text-sm font-medium text-neutral-900">
                                  {campaign.need_campaigns[0].threshold_qty}
                                </p>
                              </div>
                            )}
                            {campaign.need_campaigns[0].threshold_value && (
                              <div>
                                <p className="text-xs text-neutral-600">Target Value</p>
                                <p className="text-sm font-medium text-neutral-900">
                                  {campaign.need_campaigns[0].currency}{' '}
                                  {campaign.need_campaigns[0].threshold_value.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
                      <span className="text-sm font-medium text-primary-600">View Campaign →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
                <div className="px-4 py-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No live campaigns yet</h3>
                  <p className="text-neutral-600 mb-6">
                    Be the first to create a campaign and start aggregating demand
                  </p>
                  <Link
                    href="/create"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Create Campaign
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
