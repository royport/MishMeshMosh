import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import SelectSupplierButton from '@/components/campaigns/select-supplier-button';

export const dynamic = 'force-dynamic';

export default async function SelectSupplierPage({
  params,
}: {
  params: Promise<{ id: string; offerId: string }>;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { id, offerId } = await params;

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('kind', 'feed')
    .maybeSingle();

  if (!campaign || campaign.created_by !== user.id) {
    notFound();
  }

  if (campaign.status_feed !== 'open') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              This campaign is no longer open for supplier selection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: offer, error } = await supabase
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
    .eq('id', offerId)
    .eq('campaign_id', id)
    .maybeSingle();

  if (error || !offer) {
    notFound();
  }

  const { data: allOffers } = await supabase
    .from('supplier_offers')
    .select('id, supplier_id')
    .eq('campaign_id', id)
    .eq('status', 'signed');

  const totalValue = offer.supplier_offer_rows.reduce(
    (sum: number, row: any) => sum + row.unit_price * row.min_qty,
    0
  );

  const avgLeadTime =
    offer.supplier_offer_rows.reduce(
      (sum: number, row: any) => sum + row.lead_time_days,
      0
    ) / offer.supplier_offer_rows.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Confirm Supplier Selection</h1>
            <p className="text-blue-100">
              Review the details below before finalizing your decision
            </p>
          </div>

          <div className="p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                    Important: This Action Cannot Be Undone
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• This supplier will be officially awarded the contract</li>
                    <li>
                      • All other suppliers ({allOffers ? allOffers.length - 1 : 0}) will be
                      notified they were not selected
                    </li>
                    <li>• The Feed campaign will close and no more offers can be submitted</li>
                    <li>• The supplier&apos;s offer becomes a binding commitment</li>
                    <li>• An audit trail will be created for this decision</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Selected Supplier</h2>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {offer.supplier.user_metadata?.display_name || offer.supplier.email}
                    </h3>
                    <p className="text-sm text-slate-600">{offer.supplier.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Total Value</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Line Items</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {offer.supplier_offer_rows.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Avg Lead Time</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {Math.round(avgLeadTime)} days
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Payment Terms</div>
                    <div className="text-sm text-slate-900">
                      {offer.terms_json?.payment_terms || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Campaign Information</h2>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Campaign</div>
                    <div className="font-medium text-slate-900">{campaign.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Total Offers Received</div>
                    <div className="font-medium text-slate-900">
                      {allOffers?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">What Happens Next</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• The supplier will be notified of their selection</li>
                    <li>• Notifications will be sent to all other suppliers</li>
                    <li>• The campaign status will change to &quot;supplier_selected&quot;</li>
                    <li>• An Assignment (Reed) Deed can be generated to proceed with execution</li>
                  </ul>
                </div>
              </div>
            </div>

            <SelectSupplierButton
              campaignId={id}
              offerId={offerId}
              supplierName={
                offer.supplier.user_metadata?.display_name || offer.supplier.email
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
