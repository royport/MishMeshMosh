'use client';

import { useState } from 'react';
import { DisputeForm } from '@/components/trust/dispute-form';

interface DisputeButtonProps {
  contextType: 'deed' | 'campaign' | 'assignment' | 'offer';
  contextId: string;
  contextTitle?: string;
}

export function DisputeButton({ contextType, contextId, contextTitle }: DisputeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        File Dispute
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">File a Dispute</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <DisputeForm
                contextType={contextType}
                contextId={contextId}
                contextTitle={contextTitle}
                onClose={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
