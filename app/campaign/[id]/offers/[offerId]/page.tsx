import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OfferDetailPage({
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

  const totalValue = offer.supplier_offer_rows.reduce(
    (sum: number, row: any) => sum + row.unit_price * row.min_qty,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href={`/campaign/${id}/offers`}
          className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
        >
          ← Back to All Offers
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              SUPPLIER OFFER
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {offer.status.toUpperCase()}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {offer.supplier.user_metadata?.display_name || offer.supplier.email}
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
                      <div className="text-sm text-slate-500 font-mono">
                        {row.campaign_items.item_code}
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

        {campaign.status_feed === 'open' && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Select This Supplier</h3>
            <p className="text-slate-700 mb-6">
              By selecting this supplier, you will award them the contract and close this Feed
              campaign. All other suppliers will be notified that they were not selected.
            </p>

            <Link
              href={`/campaign/${id}/offers/${offer.id}/select`}
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all shadow-lg"
            >
              Select This Supplier
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
