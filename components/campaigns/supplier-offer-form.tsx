'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BOMItem {
  item_id: string;
  item_code: string;
  item_title: string;
  item_description: string;
  unit: string;
  total_quantity: number;
  backer_count: number;
}

interface OfferRow {
  item_id: string;
  unit_price: string;
  min_qty: string;
  lead_time_days: string;
  notes: string;
}

export default function SupplierOfferForm({
  campaignId,
  bom,
}: {
  campaignId: string;
  bom: BOMItem[];
}) {
  const router = useRouter();
  const [offerRows, setOfferRows] = useState<Record<string, OfferRow>>(
    Object.fromEntries(
      bom.map((item) => [
        item.item_id,
        {
          item_id: item.item_id,
          unit_price: '',
          min_qty: item.total_quantity.toString(),
          lead_time_days: '',
          notes: '',
        },
      ])
    )
  );
  const [terms, setTerms] = useState({
    payment_terms: '',
    delivery_terms: '',
    warranty: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateOfferRow(itemId: string, field: keyof OfferRow, value: string) {
    setOfferRows((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/supplier-offers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          offer_rows: Object.values(offerRows),
          terms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create offer');
      }

      router.push(`/workspace/offers/${data.offer_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Submit Your Offer</h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide pricing and terms for each item in the Bill of Materials
        </p>
      </div>

      <div className="p-8 space-y-8">
        {bom.map((item) => (
          <div key={item.item_id} className="border border-slate-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{item.item_title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                Code: {item.item_code} | Required: {item.total_quantity.toLocaleString()}{' '}
                {item.unit}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={offerRows[item.item_id]?.unit_price || ''}
                  onChange={(e) => updateOfferRow(item.item_id, 'unit_price', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Quantity *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={offerRows[item.item_id]?.min_qty || ''}
                  onChange={(e) => updateOfferRow(item.item_id, 'min_qty', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={item.total_quantity.toString()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lead Time (Days) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={offerRows[item.item_id]?.lead_time_days || ''}
                  onChange={(e) =>
                    updateOfferRow(item.item_id, 'lead_time_days', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={offerRows[item.item_id]?.notes || ''}
                  onChange={(e) => updateOfferRow(item.item_id, 'notes', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Special conditions or notes"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Total Price:</span>
                <span className="text-xl font-bold text-blue-600">
                  $
                  {(
                    parseFloat(offerRows[item.item_id]?.unit_price || '0') *
                    parseFloat(offerRows[item.item_id]?.min_qty || '0')
                  ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Terms & Conditions</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Terms *
              </label>
              <input
                type="text"
                required
                value={terms.payment_terms}
                onChange={(e) => setTerms({ ...terms, payment_terms: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Net 30, 50% upfront"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Delivery Terms *
              </label>
              <input
                type="text"
                required
                value={terms.delivery_terms}
                onChange={(e) => setTerms({ ...terms, delivery_terms: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., FOB, CIF, delivery location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Warranty *
              </label>
              <input
                type="text"
                required
                value={terms.warranty}
                onChange={(e) => setTerms({ ...terms, warranty: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1 year manufacturer warranty"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            By submitting, you agree to be bound by the terms of your offer
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
          </button>
        </div>
      </div>
    </form>
  );
}
