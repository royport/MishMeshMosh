import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CampaignItems from '@/components/campaigns/campaign-items';
import JoinCampaignButton from '@/components/campaigns/join-campaign-button';
import CampaignAdminControls from '@/components/campaigns/campaign-admin-controls';
import RealtimeProgress from '@/components/campaigns/realtime-progress';
import { canUserManuallyTransition } from '@/lib/campaign-transitions';

export const dynamic = 'force-dynamic';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  const { id } = await params;

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      need_campaigns(*),
      campaign_items(*),
      need_pledges(
        id,
        backer_id,
        need_pledge_rows(
          quantity,
          campaign_item_id
        )
      )
    `)
    .eq('id', id)
    .eq('kind', 'need')
    .maybeSingle();

  if (error || !campaign) {
    notFound();
  }

  const totalPledgedValue = campaign.need_pledges?.reduce((sum: number, pledge: any) => {
    return sum + pledge.need_pledge_rows?.reduce((rowSum: number, row: any) => {
      const item = campaign.campaign_items?.find((i: any) => i.id === row.campaign_item_id);
      return rowSum + (row.quantity * (item?.variant_json?.unit_price || 0));
    }, 0);
  }, 0) || 0;

  const totalBackers = new Set(campaign.need_pledges?.map((p: any) => p.backer_id)).size;

  const { data: { user } } = await supabase.auth.getUser();
  const canManualTransition = user ? await canUserManuallyTransition(user.id) : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {campaign.status_need?.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-slate-500">
              {campaign.visibility}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {campaign.title}
          </h1>

          {campaign.description && (
            <p className="text-lg text-slate-600 leading-relaxed">
              {campaign.description}
            </p>
          )}
        </div>

        {canManualTransition && (
          <CampaignAdminControls
            campaignId={campaign.id}
            currentStatus={campaign.status_need}
            canManualTransition={canManualTransition}
          />
        )}

        <RealtimeProgress campaignId={campaign.id} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Items</h2>
          <CampaignItems items={campaign.campaign_items || []} />
        </div>

        {user && campaign.status_need === 'live' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
            <div className="flex items-start justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Ready to commit?
                </h3>
                <p className="text-slate-600">
                  Join this campaign by signing a Need Deed. Your commitment becomes binding only if the campaign reaches its threshold and a supplier is assigned.
                </p>
              </div>
              <JoinCampaignButton
                campaignId={campaign.id}
                items={campaign.campaign_items || []}
              />
            </div>
          </div>
        )}

        {!user && campaign.status_need === 'live' && (
          <div className="bg-slate-100 rounded-xl border border-slate-200 p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Sign in to join this campaign
            </h3>
            <p className="text-slate-600 mb-6">
              Create an account or log in to commit to this campaign
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
