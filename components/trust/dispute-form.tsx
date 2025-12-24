'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DisputeFormProps {
  contextType: 'deed' | 'campaign' | 'assignment' | 'offer';
  contextId: string;
  contextTitle?: string;
  onClose?: () => void;
}

export function DisputeForm({
  contextType,
  contextId,
  contextTitle,
  onClose,
}: DisputeFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_type: contextType,
          context_id: contextId,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to file dispute');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          router.push('/workspace/disputes');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-green-500 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-green-900 mb-1">Dispute Filed</h3>
        <p className="text-green-700">Your dispute has been submitted for review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-medium text-amber-900">Filing a Dispute</h4>
            <p className="text-sm text-amber-700 mt-1">
              Disputes are reviewed by the platform team. Please provide clear details
              about the issue and any relevant evidence.
            </p>
          </div>
        </div>
      </div>

      {contextTitle && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Regarding
          </label>
          <p className="text-slate-900 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
            {contextTitle}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Dispute Type
        </label>
        <p className="text-slate-600 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 capitalize">
          {contextType} Issue
        </p>
      </div>

      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Reason for Dispute *
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          required
          minLength={20}
          placeholder="Please describe the issue in detail. Include relevant dates, communications, and any evidence that supports your claim..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          Minimum 20 characters. Be specific and factual.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || reason.length < 20}
          className="flex-1 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'File Dispute'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
