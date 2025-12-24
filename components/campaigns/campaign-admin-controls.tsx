'use client';

import { useState } from 'react';

export default function CampaignAdminControls({
  campaignId,
  currentStatus,
  canManualTransition,
}: {
  campaignId: string;
  currentStatus: string;
  canManualTransition: boolean;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!canManualTransition || currentStatus !== 'live') {
    return null;
  }

  async function handleManualSeed() {
    if (!confirm('Are you sure you want to manually transition this campaign to seeded status?')) {
      return;
    }

    setIsTransitioning(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/transition`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transition campaign');
      }

      setSuccess('Campaign successfully transitioned to seeded status');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTransitioning(false);
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Admin Controls</h3>
          <p className="text-sm text-amber-800 mb-4">
            You can manually transition this campaign to seeded status, bypassing automatic threshold checks.
            Use this only when necessary.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <button
            onClick={handleManualSeed}
            disabled={isTransitioning}
            className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTransitioning ? 'Transitioning...' : 'Manual Seed Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
