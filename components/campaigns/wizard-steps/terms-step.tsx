import type { CampaignFormData } from '@/lib/types/campaign';

interface TermsStepProps {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
}

export function TermsStep({ formData, updateFormData }: TermsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Commercial Terms</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Define the business terms that will govern commitments and transactions
        </p>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Deposit Policy</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="deposit_percentage" className="block text-sm font-medium text-neutral-700 mb-1">
              Deposit Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="deposit_percentage"
                min="0"
                max="100"
                value={formData.deposit_percentage}
                onChange={(e) =>
                  updateFormData({ deposit_percentage: parseInt(e.target.value) || 0 })
                }
                className="block w-24 rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600">%</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Percentage of total value required as deposit
            </p>
          </div>

          <div>
            <label htmlFor="deposit_timing" className="block text-sm font-medium text-neutral-700 mb-1">
              Deposit Timing
            </label>
            <select
              id="deposit_timing"
              value={formData.deposit_timing}
              onChange={(e) => updateFormData({ deposit_timing: e.target.value })}
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="upon_joining">Upon joining campaign</option>
              <option value="upon_seeding">Upon campaign seeding</option>
              <option value="upon_assignment">Upon supplier assignment</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Payment Structure</h3>
        <div>
          <label htmlFor="payment_terms" className="block text-sm font-medium text-neutral-700 mb-1">
            Payment Terms
          </label>
          <select
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => updateFormData({ payment_terms: e.target.value })}
            className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="net_0">Net 0 - Payment due immediately</option>
            <option value="net_15">Net 15 - Payment due within 15 days</option>
            <option value="net_30">Net 30 - Payment due within 30 days</option>
            <option value="net_60">Net 60 - Payment due within 60 days</option>
            <option value="net_90">Net 90 - Payment due within 90 days</option>
            <option value="milestone">Milestone-based payments</option>
          </select>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Delivery Terms</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="delivery_timeline" className="block text-sm font-medium text-neutral-700 mb-1">
              Expected Delivery Timeline
            </label>
            <input
              type="text"
              id="delivery_timeline"
              value={formData.delivery_timeline}
              onChange={(e) => updateFormData({ delivery_timeline: e.target.value })}
              placeholder="e.g., 30-45 days after assignment"
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="delivery_location" className="block text-sm font-medium text-neutral-700 mb-1">
              Delivery Location / Method
            </label>
            <input
              type="text"
              id="delivery_location"
              value={formData.delivery_location}
              onChange={(e) => updateFormData({ delivery_location: e.target.value })}
              placeholder="e.g., Multiple locations (individual shipping) or Central warehouse"
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Cancellation Policy</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="cancellation_notice_days" className="block text-sm font-medium text-neutral-700 mb-1">
              Notice Period (Days)
            </label>
            <input
              type="number"
              id="cancellation_notice_days"
              min="0"
              value={formData.cancellation_notice_days}
              onChange={(e) =>
                updateFormData({ cancellation_notice_days: parseInt(e.target.value) || 0 })
              }
              className="block w-32 rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Days of notice required before cancellation
            </p>
          </div>

          <div>
            <label htmlFor="cancellation_penalty_percentage" className="block text-sm font-medium text-neutral-700 mb-1">
              Cancellation Penalty
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="cancellation_penalty_percentage"
                min="0"
                max="100"
                value={formData.cancellation_penalty_percentage}
                onChange={(e) =>
                  updateFormData({ cancellation_penalty_percentage: parseInt(e.target.value) || 0 })
                }
                className="block w-24 rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600">%</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Percentage of deposit forfeited upon cancellation
            </p>
          </div>
        </div>
      </div>

      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-warning-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-900">Legal Commitment</h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>
                These terms will be embedded in legally-binding deeds signed by all participants. Make sure they accurately reflect your requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
