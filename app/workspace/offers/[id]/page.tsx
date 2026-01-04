import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import OfferSigningButton from '@/components/campaigns/offer-signing-button';

export const dynamic = 'force-dynamic';

export default async function SupplierOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const { data: offer, error } = await supabase
    .from('supplier_offers')
    .select(`
      *,
      campaigns(*),
      supplier_offer_rows(
        *,
        campaign_items(*)
      )
    `)
    .eq('id', id)
    .eq('supplier_id', user.id)
    .maybeSingle();

  if (error || !offer) {
    notFound();
  }

  const totalValue = offer.supplier_offer_rows.reduce(
    (sum: number, row: any) => sum + row.unit_price * row.min_qty,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              YOUR OFFER
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {offer.status.toUpperCase()}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {offer.campaigns.title}
          </h1>

          <p className="text-lg text-slate-600">
            Offer submitted: {new Date(offer.submitted_at).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Offer Details</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Min Qty
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Lead Time
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {offer.supplier_offer_rows.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {row.campaign_items.title}
                      </div>
                      {row.notes && (
                        <div className="text-sm text-slate-500 mt-1">{row.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      ${row.unit_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {row.min_qty} {row.campaign_items.unit}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {row.lead_time_days} days
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      ${(row.unit_price * row.min_qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-900">
                    Total Offer Value:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">
                    ${totalValue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Terms & Conditions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Payment Terms</div>
              <div className="text-slate-900">{offer.terms_json?.payment_terms || '-'}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Delivery Terms</div>
              <div className="text-slate-900">{offer.terms_json?.delivery_terms || '-'}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Warranty</div>
              <div className="text-slate-900">{offer.terms_json?.warranty || '-'}</div>
            </div>
          </div>
        </div>

        {offer.status === 'submitted' && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Sign Your Feed Deed</h3>
            <p className="text-slate-700 mb-6">
              By signing, you commit to this offer. If selected by the campaign organizer, your
              offer becomes legally binding through a Feed Deed.
            </p>

            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-slate-700">
                  <p className="font-medium mb-2">What happens when you sign:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your offer becomes a binding commitment if selected</li>
                    <li>A cryptographically signed Feed Deed is generated</li>
                    <li>You cannot modify the terms after signing</li>
                    <li>The campaign organizer can review and select your offer</li>
                  </ul>
                </div>
              </div>
            </div>

            <OfferSigningButton offerId={offer.id} />
          </div>
        )}

        {offer.status === 'signed' && (
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
                <h3 className="text-lg font-semibold text-green-900">Offer Signed</h3>
                <p className="text-sm text-green-800 mt-1">
                  Your Feed Deed has been created and signed. The campaign organizer will review all
                  offers and make a selection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
