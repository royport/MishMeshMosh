'use client';

import Link from 'next/link';
import CreateAssignmentButton from './create-assignment-button';

export default function FeedCampaignAdmin({
  campaignId,
  statusFeed,
  offerCount,
  needCampaignId,
  selectedOfferId,
  assignmentId,
}: {
  campaignId: string;
  statusFeed: string;
  offerCount: number;
  needCampaignId?: string | null;
  selectedOfferId?: string | null;
  assignmentId?: string | null;
}) {
  return (
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
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Campaign Management</h3>

          {statusFeed === 'open' && (
            <>
              <p className="text-sm text-blue-800 mb-4">
                This Feed campaign is open for supplier offers. You have received{' '}
                <span className="font-bold">{offerCount}</span>{' '}
                {offerCount === 1 ? 'signed offer' : 'signed offers'}.
              </p>

              {offerCount > 0 ? (
                <Link
                  href={`/campaign/${campaignId}/offers`}
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review & Select Supplier
                </Link>
              ) : (
                <p className="text-sm text-blue-700">
                  Waiting for suppliers to submit offers...
                </p>
              )}
            </>
          )}

          {statusFeed === 'supplier_selected' && (
            <>
              <p className="text-sm text-blue-800 mb-4">
                A supplier has been selected for this campaign.{' '}
                {assignmentId
                  ? 'An Assignment (Reed) Deed has been created.'
                  : 'You can now create an Assignment (Reed) Deed to execute the orders.'}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={`/campaign/${campaignId}/offers`}
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Selected Supplier
                </Link>

                {assignmentId ? (
                  <Link
                    href={`/workspace/assignments/${assignmentId}`}
                    className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Assignment
                  </Link>
                ) : needCampaignId && selectedOfferId ? (
                  <CreateAssignmentButton
                    campaignNeedId={needCampaignId}
                    campaignFeedId={campaignId}
                    selectedOfferId={selectedOfferId}
                  />
                ) : null}
              </div>
            </>
          )}

          {statusFeed === 'closed_no_winner' && (
            <p className="text-sm text-blue-800">
              This campaign was closed without selecting a supplier.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
