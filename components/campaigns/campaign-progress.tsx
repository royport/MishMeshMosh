'use client';

export default function CampaignProgress({
  campaign,
  totalPledgedValue,
  totalBackers,
}: {
  campaign: any;
  totalPledgedValue: number;
  totalBackers: number;
}) {
  const needCampaign = campaign.need_campaigns?.[0];

  if (!needCampaign) return null;

  const thresholdType = needCampaign.threshold_type;
  const currency = needCampaign.currency || 'USD';

  let progress = 0;
  let currentLabel = '';
  let targetLabel = '';

  if (thresholdType === 'value' && needCampaign.threshold_value) {
    progress = (totalPledgedValue / needCampaign.threshold_value) * 100;
    currentLabel = `${currency} ${totalPledgedValue.toLocaleString()}`;
    targetLabel = `${currency} ${needCampaign.threshold_value.toLocaleString()}`;
  } else if (thresholdType === 'quantity' && needCampaign.threshold_qty) {
    const totalQty = campaign.need_pledges?.reduce((sum: number, pledge: any) => {
      return sum + pledge.need_pledge_rows?.reduce((rowSum: number, row: any) => {
        return rowSum + parseFloat(row.quantity);
      }, 0);
    }, 0) || 0;

    progress = (totalQty / needCampaign.threshold_qty) * 100;
    currentLabel = `${totalQty.toLocaleString()} units`;
    targetLabel = `${needCampaign.threshold_qty.toLocaleString()} units`;
  }

  progress = Math.min(progress, 100);

  const daysLeft = needCampaign.deadline_at
    ? Math.max(0, Math.ceil((new Date(needCampaign.deadline_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Campaign Progress</h2>

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
          <div className="text-2xl font-bold text-slate-900">{totalBackers}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            {progress.toFixed(1)}% of threshold reached
          </span>
          {daysLeft !== null && (
            <span className="text-sm font-medium text-slate-700">
              {daysLeft} days left
            </span>
          )}
        </div>

        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {progress >= 100 && (
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
    </div>
  );
}
