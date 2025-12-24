'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectSupplierButton({
  campaignId,
  offerId,
  supplierName,
}: {
  campaignId: string;
  offerId: string;
  supplierName: string;
}) {
  const router = useRouter();
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState('');

  async function handleSelect() {
    if (
      !confirm(
        `Are you absolutely sure you want to select ${supplierName}?\n\nThis action cannot be undone. The campaign will close and all other suppliers will be notified.`
      )
    ) {
      return;
    }

    setIsSelecting(true);
    setError('');

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/select-supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to select supplier');
      }

      router.push(`/campaign/${campaignId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSelecting(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSelect}
          disabled={isSelecting}
          className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {isSelecting ? 'Confirming Selection...' : 'Confirm Selection'}
        </button>
      </div>
    </div>
  );
}
