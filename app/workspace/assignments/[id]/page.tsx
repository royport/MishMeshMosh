import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MilestoneManager from '@/components/fulfillment/milestone-manager';
import BackerTrackingView from '@/components/fulfillment/backer-tracking-view';
import { DisputeButton } from '@/components/trust/dispute-button';

export const dynamic = 'force-dynamic';

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(`
      *,
      needCampaign:campaigns!campaign_need_id(
        *,
        need_campaigns(*)
      ),
      feedCampaign:campaigns!campaign_feed_id(*),
      selectedOffer:supplier_offers!selected_offer_id(
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
      ),
      assignmentDeed:deeds!assignment_deed_id(
        *,
        deed_signers(
          *,
          user:users(id, email, user_metadata)
        )
      ),
      assignment_need_deeds(
        *,
        needDeed:deeds!need_deed_id(*)
      )
    `)
    .eq('id', params.id)
    .maybeSingle();

  const { data: milestones } = await supabase
    .from('fulfillment_milestones')
    .select('*')
    .eq('assignment_id', params.id)
    .order('created_at', { ascending: true });

  if (error || !assignment) {
    notFound();
  }

  const deed = assignment.assignmentDeed;
  const docJson = deed.doc_json as any;

  const userSigner = deed.deed_signers?.find((s: any) => s.user_id === user.id);
  const canSign = userSigner && userSigner.status === 'invited';

  const allSigners = deed.deed_signers || [];
  const signedCount = allSigners.filter((s: any) => s.status === 'signed').length;
  const totalSigners = allSigners.length;

  const isCreator =
    assignment.needCampaign.created_by === user.id ||
    assignment.feedCampaign.created_by === user.id;

  const isSupplier = assignment.selectedOffer.supplier_id === user.id;
  const isBacker = userSigner?.signer_kind === 'backer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/workspace"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Workspace
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              ASSIGNMENT (REED) DEED
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {assignment.status.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
              {signedCount}/{totalSigners} SIGNED
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">{docJson.title}</h1>
          <p className="text-lg text-slate-600">
            Created on {new Date(docJson.created_at).toLocaleDateString()}
          </p>
        </div>

        {userSigner && (
          <div
            className={`rounded-xl border p-6 mb-8 ${
              userSigner.status === 'signed'
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {userSigner.status === 'signed' ? (
                <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div className="flex-1">
                {userSigner.status === 'signed' ? (
                  <>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                      You have signed this deed
                    </h3>
                    <p className="text-sm text-green-800">
                      Signed on {new Date(userSigner.signed_at!).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                      Your signature is required
                    </h3>
                    <p className="text-sm text-yellow-800 mb-4">
                      Please review the details below and sign this assignment deed to proceed.
                    </p>
                    {canSign && (
                      <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Sign Deed
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Financial Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-500 mb-1">Total Order Value</div>
              <div className="text-3xl font-bold text-blue-600">
                ${docJson.financial_summary.total_order_value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-500 mb-1">WEED Platform Fee (3%)</div>
              <div className="text-2xl font-bold text-slate-900">
                ${docJson.financial_summary.weed_fee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-500 mb-1">Currency</div>
              <div className="text-2xl font-bold text-slate-900">
                {docJson.financial_summary.currency}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Parties</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Supplier</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-medium text-slate-900">
                  {assignment.selectedOffer.supplier.user_metadata?.display_name ||
                    assignment.selectedOffer.supplier.email}
                </div>
                <div className="text-sm text-slate-600">
                  {assignment.selectedOffer.supplier.email}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Backers ({docJson.parties.backers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allSigners
                  .filter((s: any) => s.signer_kind === 'backer')
                  .map((signer: any) => (
                    <div key={signer.id} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">
                            {signer.user.user_metadata?.display_name || signer.user.email}
                          </div>
                          <div className="text-sm text-slate-600">{signer.user.email}</div>
                        </div>
                        {signer.status === 'signed' ? (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Items</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Item</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Quantity
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
                {docJson.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-500 font-mono">{item.item_code}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {item.lead_time_days} days
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Terms & Conditions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Payment Terms</div>
              <div className="text-slate-900">{docJson.terms.payment_terms || '-'}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Delivery Terms</div>
              <div className="text-slate-900">{docJson.terms.delivery_terms || '-'}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Warranty</div>
              <div className="text-slate-900">{docJson.terms.warranty || '-'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Linked Deeds</h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-2">Need Campaign</div>
              <Link
                href={`/campaign/${docJson.linked_deeds.need_campaign_id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {assignment.needCampaign.title} →
              </Link>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500 mb-2">Feed Campaign</div>
              <Link
                href={`/feed/${docJson.linked_deeds.feed_campaign_id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {assignment.feedCampaign.title} →
              </Link>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500 mb-2">
                Connected Need Deeds ({assignment.assignment_need_deeds.length})
              </div>
              <div className="text-slate-600 text-sm">
                This assignment connects {assignment.assignment_need_deeds.length} signed Need Deeds
                from backers to the selected supplier offer.
              </div>
            </div>
          </div>
        </div>

        {isBacker ? (
          <BackerTrackingView milestones={milestones || []} assignmentId={params.id} />
        ) : (
          <MilestoneManager
            assignmentId={params.id}
            milestones={milestones || []}
            isSupplier={isSupplier}
            canManage={isCreator || isSupplier}
          />
        )}

        {/* Dispute Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Having Issues?</h2>
              <p className="text-slate-600 text-sm max-w-xl">
                If you're experiencing problems with this assignment, you can file a dispute.
                Our team will review the case and help resolve any conflicts between parties.
              </p>
            </div>
            <DisputeButton
              contextType="assignment"
              contextId={params.id}
              contextTitle={docJson.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
