'use client';

import { getReputationColor, getReputationIcon, type ReputationData } from '@/lib/reputation';

interface ReputationDisplayProps {
  reputation: ReputationData;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ReputationDisplay({
  reputation,
  showDetails = false,
  size = 'md',
}: ReputationDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="inline-flex flex-col">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${getReputationColor(reputation.level)} ${sizeClasses[size]}`}
      >
        <span>{getReputationIcon(reputation.level)}</span>
        <span className="capitalize">{reputation.level}</span>
        <span className="opacity-75">({reputation.score})</span>
      </div>

      {showDetails && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 text-xs">Campaigns Created</p>
            <p className="font-semibold text-slate-900">{reputation.stats.campaignsCreated}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-600 text-xs">Successful</p>
            <p className="font-semibold text-green-900">{reputation.stats.campaignsSuccessful}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-600 text-xs">Deeds Signed</p>
            <p className="font-semibold text-blue-900">{reputation.stats.deedsSigned}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-purple-600 text-xs">Fulfilled</p>
            <p className="font-semibold text-purple-900">{reputation.stats.deedsFulfilled}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReputationBadge({ reputation }: { reputation: ReputationData }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getReputationColor(reputation.level)}`}
      title={`Reputation: ${reputation.score} points`}
    >
      {getReputationIcon(reputation.level)}
      {reputation.level}
    </span>
  );
}
