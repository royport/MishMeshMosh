'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAssignmentButton({
  campaignNeedId,
  campaignFeedId,
  selectedOfferId,
}: {
  campaignNeedId: string;
  campaignFeedId: string;
  selectedOfferId: string;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (
      !confirm(
        'Create an Assignment (Reed) Deed?\n\nThis will generate a binding deed that links the Need campaign backers with the selected supplier. All parties will need to sign before execution.'
      )
    ) {
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/assignments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_need_id: campaignNeedId,
          campaign_feed_id: campaignFeedId,
          selected_offer_id: selectedOfferId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create assignment');
      }

      router.push(`/workspace/assignments/${data.assignment_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        {isCreating ? 'Creating Assignment...' : 'Create Assignment (Reed) Deed'}
      </button>
    </div>
  );
}
