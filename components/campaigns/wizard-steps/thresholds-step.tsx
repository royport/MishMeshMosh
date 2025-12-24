import type { CampaignFormData } from '@/lib/types/campaign';

interface ThresholdsStepProps {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
}

export function ThresholdsStep({ formData, updateFormData }: ThresholdsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Thresholds & Deadline</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Define the minimum requirements for your campaign to seed successfully
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Threshold Type <span className="text-error-600">*</span>
        </label>
        <div className="space-y-3">
          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-neutral-50">
            <input
              type="radio"
              name="threshold_type"
              value="quantity"
              checked={formData.threshold_type === 'quantity'}
              onChange={(e) => updateFormData({ threshold_type: 'quantity' })}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-neutral-900">Quantity Based</div>
              <div className="text-sm text-neutral-600">
                Campaign succeeds when a minimum number of backers join
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-neutral-50">
            <input
              type="radio"
              name="threshold_type"
              value="value"
              checked={formData.threshold_type === 'value'}
              onChange={(e) => updateFormData({ threshold_type: 'value' })}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-neutral-900">Value Based</div>
              <div className="text-sm text-neutral-600">
                Campaign succeeds when total committed value reaches a threshold
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-neutral-50">
            <input
              type="radio"
              name="threshold_type"
              value="both"
              checked={formData.threshold_type === 'both'}
              onChange={(e) => updateFormData({ threshold_type: 'both' })}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-neutral-900">Both Quantity & Value</div>
              <div className="text-sm text-neutral-600">
                Campaign must meet both minimum backers and minimum value
              </div>
            </div>
          </label>
        </div>
      </div>

      {(formData.threshold_type === 'quantity' || formData.threshold_type === 'both') && (
        <div>
          <label htmlFor="threshold_qty" className="block text-sm font-medium text-neutral-700 mb-1">
            Minimum Number of Backers <span className="text-error-600">*</span>
          </label>
          <input
            type="number"
            id="threshold_qty"
            min="1"
            value={formData.threshold_qty || ''}
            onChange={(e) =>
              updateFormData({ threshold_qty: e.target.value ? parseInt(e.target.value) : null })
            }
            placeholder="e.g., 10"
            className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Minimum number of backers needed for the campaign to proceed
          </p>
        </div>
      )}

      {(formData.threshold_type === 'value' || formData.threshold_type === 'both') && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label htmlFor="threshold_value" className="block text-sm font-medium text-neutral-700 mb-1">
              Minimum Total Value <span className="text-error-600">*</span>
            </label>
            <input
              type="number"
              id="threshold_value"
              min="0"
              step="0.01"
              value={formData.threshold_value || ''}
              onChange={(e) =>
                updateFormData({ threshold_value: e.target.value ? parseFloat(e.target.value) : null })
              }
              placeholder="e.g., 50000"
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-neutral-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => updateFormData({ currency: e.target.value })}
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="deadline_at" className="block text-sm font-medium text-neutral-700 mb-1">
          Campaign Deadline
        </label>
        <input
          type="datetime-local"
          id="deadline_at"
          value={formData.deadline_at}
          onChange={(e) => updateFormData({ deadline_at: e.target.value })}
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Optional deadline by which the campaign must meet thresholds to proceed
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-900">About Seeding</h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>
                Once your campaign meets these thresholds, it will automatically seed and move to the Feed phase, where suppliers can make offers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
