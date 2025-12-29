import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CampaignOffersPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

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

  if (campaign.created_by !== user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">You do not have permission to view offers for this campaign.</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: offers } = await supabase
    .from('supplier_offers')
    .select(`
      *,
      supplier:users!supplier_id(
        id,
        email,
        user_metadata
      ),
      supplier_offer_rows(
        *,
        campaign_items(*)
      )
    `)
    .eq('campaign_id', id)
    .eq('status', 'signed')
    .order('submitted_at', { ascending: true });

  const calculateOfferTotal = (offerRows: any[]) => {
    return offerRows.reduce((sum, row) => sum + row.unit_price * row.min_qty, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href={`/campaign/${id}`}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Campaign
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              FEED CAMPAIGN
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {campaign.status_feed?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">{campaign.title}</h1>
          <p className="text-lg text-slate-600">Review and compare supplier offers</p>
        </div>

        {!offers || offers.length === 0 ? (
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
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No offers submitted yet</h3>
            <p className="text-slate-600">
              Suppliers have not submitted signed offers for this campaign yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                    {offers.length} Signed {offers.length === 1 ? 'Offer' : 'Offers'} Received
                  </h3>
                  <p className="text-sm text-blue-800">
                    Review the offers below and select a supplier. All offers are legally binding
                    commitments backed by signed Feed Deeds.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {offers.map((offer: any) => {
                const totalValue = calculateOfferTotal(offer.supplier_offer_rows);
                const avgLeadTime =
                  offer.supplier_offer_rows.reduce(
                    (sum: number, row: any) => sum + row.lead_time_days,
                    0
                  ) / offer.supplier_offer_rows.length;

                return (
                  <div
                    key={offer.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 px-8 py-6 border-b border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            {offer.supplier.user_metadata?.display_name || offer.supplier.email}
                          </h3>
                          <p className="text-sm text-slate-600">{offer.supplier.email}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-500 mb-1">Total Offer Value</div>
                          <div className="text-3xl font-bold text-blue-600">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm text-slate-500 mb-1">Line Items</div>
                          <div className="text-2xl font-bold text-slate-900">
                            {offer.supplier_offer_rows.length}
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm text-slate-500 mb-1">Avg Lead Time</div>
                          <div className="text-2xl font-bold text-slate-900">
                            {Math.round(avgLeadTime)} days
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm text-slate-500 mb-1">Submitted</div>
                          <div className="text-lg font-medium text-slate-900">
                            {new Date(offer.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">
                          Terms & Conditions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500 mb-1">Payment Terms</div>
                            <div className="text-slate-900 font-medium">
                              {offer.terms_json?.payment_terms || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500 mb-1">Delivery Terms</div>
                            <div className="text-slate-900 font-medium">
                              {offer.terms_json?.delivery_terms || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500 mb-1">Warranty</div>
                            <div className="text-slate-900 font-medium">
                              {offer.terms_json?.warranty || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/campaign/${id}/offers/${offer.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Detailed Breakdown →
                          </Link>

                          {campaign.status_feed === 'open' && (
                            <Link
                              href={`/campaign/${id}/offers/${offer.id}/select`}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all shadow-md"
                            >
                              Select This Supplier
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {offers.length > 1 && campaign.status_feed === 'open' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Compare All Offers Side-by-Side
                </h3>
                <p className="text-slate-600 mb-6">
                  View a detailed comparison table to make an informed decision
                </p>
                <Link
                  href={`/campaign/${id}/offers/compare`}
                  className="inline-block px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Compare Offers
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
