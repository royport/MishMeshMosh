import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SupplierOffersPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-slate-600">Please sign in to view your offers.</p>
      </div>
    );
  }

  const { data: offers } = await supabase
    .from('supplier_offers')
    .select(`
      *,
      campaigns(
        id,
        title,
        status_feed
      ),
      supplier_offer_rows(
        unit_price,
        min_qty
      )
    `)
    .eq('supplier_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Offers</h1>
        <p className="text-slate-600">Track your submitted offers and their status</p>
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
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No offers yet</h3>
          <p className="text-slate-600 mb-6">
            Browse open Feed campaigns to submit your first offer
          </p>
          <Link
            href="/explore/feeds"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {offers.map((offer: any) => {
            const totalValue = offer.supplier_offer_rows.reduce(
              (sum: number, row: any) => sum + row.unit_price * row.min_qty,
              0
            );

            return (
              <Link
                key={offer.id}
                href={`/workspace/offers/${offer.id}`}
                className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {offer.campaigns.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Submitted: {new Date(offer.submitted_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        offer.status === 'signed'
                          ? 'bg-green-100 text-green-700'
                          : offer.status === 'submitted'
                          ? 'bg-blue-100 text-blue-700'
                          : offer.status === 'selected'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {offer.status.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        offer.campaigns.status_feed === 'open'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Campaign: {offer.campaigns.status_feed}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Total Offer Value</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 mb-1">Line Items</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {offer.supplier_offer_rows.length}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
