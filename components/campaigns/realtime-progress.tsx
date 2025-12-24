'use client';

import { useEffect, useState } from 'react';

interface ProgressData {
  current_qty: number;
  threshold_qty: number;
  current_value: number;
  threshold_value: number;
  threshold_type: string;
  threshold_met: boolean;
  backer_count: number;
  pledge_count: number;
  progress_percentage: number;
}

export default function RealtimeProgress({ campaignId }: { campaignId: string }) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function loadProgress() {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/progress`);
      if (!response.ok) {
        throw new Error('Failed to load progress');
      }
      const data = await response.json();
      setProgress(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!progress) return null;

  const progressPercent = Math.min(progress.progress_percentage, 100);

  let currentLabel = '';
  let targetLabel = '';

  if (progress.threshold_type === 'quantity') {
    currentLabel = `${progress.current_qty.toLocaleString()} units`;
    targetLabel = `${progress.threshold_qty.toLocaleString()} units`;
  } else if (progress.threshold_type === 'value') {
    currentLabel = `$${progress.current_value.toLocaleString()}`;
    targetLabel = `$${progress.threshold_value.toLocaleString()}`;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Campaign Progress</h2>
        <span className="text-xs text-slate-500">Updates every 15s</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">Current</div>
          <div className="text-2xl font-bold text-slate-900">{currentLabel}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">Target</div>
          <div className="text-2xl font-bold text-slate-900">{targetLabel}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">Backers</div>
          <div className="text-2xl font-bold text-slate-900">{progress.backer_count}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            {progressPercent.toFixed(1)}% of threshold reached
          </span>
        </div>

        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {progress.threshold_met && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-900">
              Threshold reached! This campaign is ready to seed.
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{progress.pledge_count} total pledges</span>
        </div>
      </div>
    </div>
  );
}
