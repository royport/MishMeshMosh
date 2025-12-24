import type { CampaignFormData } from '@/lib/types/campaign';

interface PreviewStepProps {
  formData: CampaignFormData;
}

export function PreviewStep({ formData }: PreviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Campaign Preview</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Review your campaign details before publishing
        </p>
      </div>

      <div className="border border-neutral-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{formData.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                Need Campaign
              </span>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {formData.visibility === 'public' ? 'Public' : formData.visibility === 'unlisted' ? 'Unlisted' : 'Private'}
              </span>
            </div>
          </div>
        </div>

        {formData.description && (
          <div className="mb-6">
            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{formData.description}</p>
          </div>
        )}

        <div className="border-t border-neutral-200 pt-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Campaign Items</h4>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  {item.item_code && (
                    <span className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      {item.item_code}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {item.unit}
                  </span>
                </div>
                <h5 className="text-sm font-medium text-neutral-900">{item.title}</h5>
                {item.description && (
                  <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6 mt-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Thresholds</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">Threshold Type</p>
              <p className="text-sm font-medium text-neutral-900 capitalize">
                {formData.threshold_type === 'both' ? 'Quantity & Value' : formData.threshold_type}
              </p>
            </div>
            {(formData.threshold_type === 'quantity' || formData.threshold_type === 'both') && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-600 mb-1">Minimum Backers</p>
                <p className="text-sm font-medium text-neutral-900">
                  {formData.threshold_qty} backers
                </p>
              </div>
            )}
            {(formData.threshold_type === 'value' || formData.threshold_type === 'both') && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-600 mb-1">Minimum Value</p>
                <p className="text-sm font-medium text-neutral-900">
                  {formData.currency} {formData.threshold_value?.toLocaleString()}
                </p>
              </div>
            )}
            {formData.deadline_at && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-600 mb-1">Deadline</p>
                <p className="text-sm font-medium text-neutral-900">
                  {new Date(formData.deadline_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6 mt-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Commercial Terms</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">Deposit</p>
              <p className="text-sm font-medium text-neutral-900">
                {formData.deposit_percentage}% {formData.deposit_timing.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">Payment Terms</p>
              <p className="text-sm font-medium text-neutral-900 capitalize">
                {formData.payment_terms.replace(/_/g, ' ')}
              </p>
            </div>
            {formData.delivery_timeline && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-600 mb-1">Delivery Timeline</p>
                <p className="text-sm font-medium text-neutral-900">{formData.delivery_timeline}</p>
              </div>
            )}
            {formData.delivery_location && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-600 mb-1">Delivery Location</p>
                <p className="text-sm font-medium text-neutral-900">{formData.delivery_location}</p>
              </div>
            )}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">Cancellation Policy</p>
              <p className="text-sm font-medium text-neutral-900">
                {formData.cancellation_notice_days} days notice, {formData.cancellation_penalty_percentage}% penalty
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-success-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-success-900">Ready to Publish</h3>
            <div className="mt-2 text-sm text-success-700">
              <p>
                Your campaign is ready to go live. Once published, backers can start joining and committing to your campaign.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
