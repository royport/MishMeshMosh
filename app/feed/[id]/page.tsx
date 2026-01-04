import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import FeedCampaignBOM from '@/components/campaigns/feed-campaign-bom';
import SupplierOfferForm from '@/components/campaigns/supplier-offer-form';
import FeedCampaignAdmin from '@/components/campaigns/feed-campaign-admin';
import {
  findNeedCampaignForFeed,
  getSelectedOfferForFeed,
  checkAssignmentExists,
} from '@/lib/assignment-helpers';

export const dynamic = 'force-dynamic';

export default async function FeedCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  const { id } = await params;

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      feed_campaigns(*)
    `)
    .eq('id', id)
    .eq('kind', 'feed')
    .maybeSingle();

  if (error || !campaign) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data: bom } = await supabase.rpc('get_campaign_bom', {
    p_campaign_id: id,
  });

  const { data: existingOffer } = user
    ? await supabase
        .from('supplier_offers')
        .select('id, status')
        .eq('campaign_id', id)
        .eq('supplier_id', user.id)
        .maybeSingle()
    : { data: null };

  const { data: signedOffers } = await supabase
    .from('supplier_offers')
    .select('id')
    .eq('campaign_id', id)
    .eq('status', 'signed');

  const isCreator = user && campaign.created_by === user.id;
  const offerCount = signedOffers?.length || 0;

  const needCampaignId = isCreator ? await findNeedCampaignForFeed(id) : null;
  const selectedOfferId = isCreator ? await getSelectedOfferForFeed(id) : null;
  const assignmentId = isCreator ? await checkAssignmentExists(id) : null;

  const feedCampaign = campaign.feed_campaigns?.[0];
  const daysLeft = feedCampaign?.bid_deadline_at
    ? Math.max(
        0,
        Math.ceil((new Date(feedCampaign.bid_deadline_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              SUPPLY OPPORTUNITY
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {campaign.status_feed?.replace('_', ' ').toUpperCase()}
            </span>
            {daysLeft !== null && (
              <span className="text-sm text-slate-600 font-medium">
                {daysLeft} days left to submit offers
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">{campaign.title}</h1>

          {campaign.description && (
            <p className="text-lg text-slate-600 leading-relaxed">{campaign.description}</p>
          )}
        </div>

        {isCreator ? (
          <FeedCampaignAdmin
            campaignId={id}
            statusFeed={campaign.status_feed || 'draft'}
            offerCount={offerCount}
            needCampaignId={needCampaignId}
            selectedOfferId={selectedOfferId}
            assignmentId={assignmentId}
          />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Validated Demand Opportunity
                </h3>
                <p className="text-sm text-blue-800">
                  This supply opportunity represents validated, committed demand from multiple backers who
                  have signed binding Need Deeds. The quantities below are the aggregated totals from all
                  backers.
                </p>
              </div>
            </div>
          </div>
        )}

        <FeedCampaignBOM bom={bom || []} />

        {user && campaign.status_feed === 'open' && !isCreator && (
          <div className="mt-8">
            {existingOffer ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      You have submitted an offer
                    </h3>
                    <p className="text-sm text-green-800">
                      Status: {existingOffer.status}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <SupplierOfferForm campaignId={id} bom={bom || []} />
            )}
          </div>
        )}

        {!user && campaign.status_feed === 'open' && (
          <div className="bg-slate-100 rounded-xl border border-slate-200 p-8 text-center mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sign in to submit an offer</h3>
            <p className="text-slate-600 mb-6">
              Create an account or log in to respond to this supply opportunity
            </p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
