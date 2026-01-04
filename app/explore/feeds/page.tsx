import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ExploreFeedsPage() {
  const supabase = await createClient();

  const { data: feedCampaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      feed_campaigns(*)
    `)
    .eq('kind', 'feed')
    .eq('status_feed', 'open')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-neutral-900 mb-6">Explore Feed Campaigns</h1>
      <p className="text-lg text-neutral-600 mb-12">
        Supply opportunities from validated demand - respond to Feed campaigns and submit your offers.
      </p>

      {!feedCampaigns || feedCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-neutral-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No open opportunities</h3>
          <p className="text-neutral-600">
            Check back later for new supply opportunities from validated demand campaigns
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {feedCampaigns.map((campaign: any) => {
            const feedCampaign = campaign.feed_campaigns[0];
            const daysLeft = feedCampaign?.bid_deadline_at
              ? Math.max(
                  0,
                  Math.ceil(
                    (new Date(feedCampaign.bid_deadline_at).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : null;

            return (
              <Link
                key={campaign.id}
                href={`/feed/${campaign.id}`}
                className="block bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      OPEN
                    </span>
                    {daysLeft !== null && (
                      <span className="text-sm text-neutral-600 font-medium">
                        {daysLeft} days left
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-neutral-900 mb-2">{campaign.title}</h3>

                {campaign.description && (
                  <p className="text-neutral-600 mb-4 line-clamp-2">{campaign.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <span className="text-sm text-neutral-500">
                    Posted: {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View Details →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
