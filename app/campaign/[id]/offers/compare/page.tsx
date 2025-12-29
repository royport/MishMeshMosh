import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CompareOffersPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('kind', 'feed')
    .maybeSingle();

  if (error || !campaign) {
    notFound();
  }

  if (campaign.created_by !== user.id) {
    notFound();
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

  const { data: items } = await supabase
    .from('campaign_items')
    .select('*')
    .eq('campaign_id', id)
    .order('item_code', { ascending: true });

  if (!offers || offers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No offers to compare.</p>
          </div>
        </div>
      </div>
    );
  }

  const offersByItem = items?.map((item: any) => {
    const offerRows = offers.map((offer: any) => {
      const row = offer.supplier_offer_rows.find(
        (r: any) => r.campaign_items.id === item.id
      );
      return {
        offerId: offer.id,
        supplierName:
          offer.supplier.user_metadata?.display_name || offer.supplier.email,
        unitPrice: row?.unit_price || null,
        minQty: row?.min_qty || null,
        leadTime: row?.lead_time_days || null,
        notes: row?.notes || null,
      };
    });
    return {
      item,
      offers: offerRows,
    };
  });

  const offerTotals = offers.map((offer: any) => {
    const total = offer.supplier_offer_rows.reduce(
      (sum: number, row: any) => sum + row.unit_price * row.min_qty,
      0
    );
    const avgLeadTime =
      offer.supplier_offer_rows.reduce(
        (sum: number, row: any) => sum + row.lead_time_days,
        0
      ) / offer.supplier_offer_rows.length;
    return {
      offerId: offer.id,
      supplierName:
        offer.supplier.user_metadata?.display_name || offer.supplier.email,
      total,
      avgLeadTime,
      paymentTerms: offer.terms_json?.payment_terms || '-',
      deliveryTerms: offer.terms_json?.delivery_terms || '-',
      warranty: offer.terms_json?.warranty || '-',
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-full mx-auto px-4 py-12">
        <div className="mb-8 max-w-7xl mx-auto">
          <Link
            href={`/campaign/${id}/offers`}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Offers
          </Link>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">Compare All Offers</h1>
          <p className="text-lg text-slate-600">
            Side-by-side comparison of {offers.length} supplier offers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-900">Summary Comparison</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">
                    Metric
                  </th>
                  {offerTotals.map((offer: any) => (
                    <th
                      key={offer.offerId}
                      className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase"
                    >
                      {offer.supplierName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 font-bold text-slate-900">Total Offer Value</td>
                  {offerTotals.map((offer: any) => (
                    <td key={offer.offerId} className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        ${offer.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Avg Lead Time</td>
                  {offerTotals.map((offer: any) => (
                    <td key={offer.offerId} className="px-6 py-4 text-center text-slate-900">
                      {Math.round(offer.avgLeadTime)} days
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Payment Terms</td>
                  {offerTotals.map((offer: any) => (
                    <td key={offer.offerId} className="px-6 py-4 text-center text-slate-900">
                      {offer.paymentTerms}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Delivery Terms</td>
                  {offerTotals.map((offer: any) => (
                    <td key={offer.offerId} className="px-6 py-4 text-center text-slate-900">
                      {offer.deliveryTerms}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Warranty</td>
                  {offerTotals.map((offer: any) => (
                    <td key={offer.offerId} className="px-6 py-4 text-center text-slate-900">
                      {offer.warranty}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">Action</td>
                  {offerTotals.map((offer: any) => (
                    <td key={offer.offerId} className="px-6 py-4 text-center">
                      <Link
                        href={`/campaign/${id}/offers/${offer.offerId}/select`}
                        className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-900">Item-by-Item Comparison</h2>
          </div>

          <div className="overflow-x-auto">
            {offersByItem?.map((itemData: any, idx: number) => (
              <div key={itemData.item.id} className={idx > 0 ? 'border-t-2 border-slate-300' : ''}>
                <div className="bg-slate-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-mono font-bold text-slate-600 mr-3">
                        {itemData.item.item_code}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {itemData.item.title}
                      </span>
                    </div>
                  </div>
                </div>

                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                        Min Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                        Lead Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {itemData.offers.map((offer: any) => (
                      <tr key={offer.offerId} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {offer.supplierName}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {offer.unitPrice ? (
                            <span className="font-semibold text-slate-900">
                              ${offer.unitPrice.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-900">
                          {offer.minQty ? offer.minQty.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-900">
                          {offer.leadTime ? `${offer.leadTime} days` : '-'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 text-sm">
                          {offer.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
