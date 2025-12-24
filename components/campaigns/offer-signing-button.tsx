'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferSigningButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  async function handleSign() {
    if (
      !confirm(
        'By signing, you commit to this offer. If selected, it becomes legally binding. Are you sure?'
      )
    ) {
      return;
    }

    setIsSigning(true);
    setError('');

    try {
      const response = await fetch(`/api/supplier-offers/${offerId}/sign`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign offer');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSigning(false);
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
        onClick={handleSign}
        disabled={isSigning}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        {isSigning ? 'Signing...' : 'Sign Feed Deed'}
      </button>
    </div>
  );
}
