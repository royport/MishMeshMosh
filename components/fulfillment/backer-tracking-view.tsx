'use client';

import { useState } from 'react';

interface Milestone {
  id: string;
  title: string;
  due_at: string | null;
  status: 'pending' | 'in_progress' | 'delivered' | 'accepted' | 'failed' | 'disputed';
  metadata_json: any;
  created_at: string;
  updated_at: string;
}

interface BackerTrackingViewProps {
  milestones: Milestone[];
  assignmentId: string;
}

export default function BackerTrackingView({
  milestones,
  assignmentId,
}: BackerTrackingViewProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'delivered':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'disputed':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  }

  function getProgressPercentage() {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter(
      (m) => m.status === 'accepted' || m.status === 'delivered'
    ).length;
    return Math.round((completedCount / milestones.length) * 100);
  }

  async function handleConfirmDelivery(milestoneId: string) {
    if (!confirm('Confirm that you have received and accepted this delivery?')) {
      return;
    }

    setIsConfirming(true);
    try {
      const response = await fetch(`/api/milestones/${milestoneId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to confirm delivery. Please try again.');
      }
    } catch (error) {
      alert('Failed to confirm delivery. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  }

  const progressPercentage = getProgressPercentage();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Fulfillment Progress</h2>
          <span className="text-3xl font-bold text-blue-600">{progressPercentage}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-sm text-slate-600 mt-2">
          Track your order fulfillment and confirm delivery of milestones
        </p>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No milestones yet</h3>
          <p className="text-slate-600">
            The supplier will add fulfillment milestones soon
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const metadata = milestone.metadata_json || {};
            const isDelivered = milestone.status === 'delivered';
            const isAccepted = milestone.status === 'accepted';

            return (
              <div
                key={milestone.id}
                className="relative border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 ml-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          milestone.status
                        )}`}
                      >
                        {milestone.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {milestone.due_at && (
                        <span className="text-sm text-slate-500">
                          Due: {new Date(milestone.due_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>

                    {metadata.notes && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-slate-700">{metadata.notes}</p>
                      </div>
                    )}

                    {metadata.proof_url && (
                      <div className="mt-3">
                        <a
                          href={metadata.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          View Proof of Delivery
                        </a>
                      </div>
                    )}

                    <p className="text-sm text-slate-500 mt-3">
                      Last updated {new Date(milestone.updated_at).toLocaleString()}
                    </p>
                  </div>

                  {isDelivered && !isAccepted && (
                    <button
                      onClick={() => handleConfirmDelivery(milestone.id)}
                      disabled={isConfirming}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isConfirming ? 'Confirming...' : 'Confirm Received'}
                    </button>
                  )}

                  {isAccepted && (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">Confirmed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Confirm When You Receive Items
            </h3>
            <p className="text-sm text-blue-800">
              When the supplier marks a milestone as delivered, review the delivery proof and
              confirm receipt by clicking the &quot;Confirm Received&quot; button. This helps ensure
              accountability throughout the fulfillment process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
