'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  kind: string;
  status_need: string | null;
  status_feed: string | null;
}

export function CampaignModerationActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentStatus = campaign.status_need || campaign.status_feed;

  async function handleAction(action: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Actions ▾'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="py-1">
              {currentStatus === 'review' && (
                <>
                  <button
                    onClick={() => handleAction('approve')}
                    className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                  >
                    ✓ Approve & Go Live
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    ✗ Reject
                  </button>
                </>
              )}
              {currentStatus === 'live' && (
                <button
                  onClick={() => handleAction('suspend')}
                  className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
                >
                  ⏸ Suspend Campaign
                </button>
              )}
              {(currentStatus === 'canceled' || currentStatus === 'closed_unseeded') && (
                <button
                  onClick={() => handleAction('reactivate')}
                  className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                >
                  ↻ Reactivate
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 border-t border-slate-100"
              >
                🗑 Delete Permanently
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
