'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Dispute {
  id: string;
  status: string;
  context_type: string;
  context_id: string;
}

export function DisputeResolutionActions({ dispute }: { dispute: Dispute }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'resolve' | 'close' | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!action) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      setShowModal(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkInReview() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'in_review' }),
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
    }
  }

  if (dispute.status === 'resolved' || dispute.status === 'closed') {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {dispute.status === 'open' && (
          <button
            onClick={handleMarkInReview}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 disabled:opacity-50"
          >
            Mark In Review
          </button>
        )}
        <button
          onClick={() => {
            setAction('resolve');
            setShowModal(true);
          }}
          disabled={isLoading}
          className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 disabled:opacity-50"
        >
          Resolve
        </button>
        <button
          onClick={() => {
            setAction('close');
            setShowModal(true);
          }}
          disabled={isLoading}
          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200 disabled:opacity-50"
        >
          Close
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />

            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {action === 'resolve' ? 'Resolve Dispute' : 'Close Dispute'}
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe the resolution or reason for closing..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !notes.trim()}
                  className={`flex-1 px-4 py-2 text-white font-medium rounded-lg disabled:opacity-50 ${
                    action === 'resolve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : action === 'resolve' ? 'Resolve' : 'Close'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
