'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinCampaignModal({
  campaignId,
  items,
  onClose,
}: {
  campaignId: string;
  items: any[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<'quantities' | 'review' | 'signature' | 'success'>('quantities');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deedId, setDeedId] = useState<string | null>(null);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setQuantities(prev => {
        const newQty = { ...prev };
        delete newQty[itemId];
        return newQty;
      });
    } else {
      setQuantities(prev => ({ ...prev, [itemId]: numValue }));
    }
  };

  const selectedItems = items.filter(item => quantities[item.id] > 0);
  const totalValue = selectedItems.reduce((sum, item) => {
    const unitPrice = item.variant_json?.unit_price || 0;
    return sum + (unitPrice * quantities[item.id]);
  }, 0);

  const handleProceedToReview = () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item with a quantity greater than 0');
      return;
    }
    setError(null);
    setStep('review');
  };

  const handleProceedToSignature = () => {
    setStep('signature');
  };

  const handleSign = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/deeds/create-need-deed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          items: selectedItems.map(item => ({
            itemId: item.id,
            quantity: quantities[item.id],
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create deed');
      }

      const data = await response.json();
      setDeedId(data.deedId);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      router.refresh();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {step === 'quantities' && 'Select Quantities'}
            {step === 'review' && 'Review Your Commitment'}
            {step === 'signature' && 'Sign Need Deed'}
            {step === 'success' && 'Success!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {step === 'quantities' && (
            <div>
              <p className="text-slate-600 mb-6">
                Select the quantities you want to commit to purchasing. Your commitment becomes binding only if the campaign succeeds and a supplier is assigned.
              </p>

              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                        )}
                        <div className="text-sm text-slate-500">
                          Unit: {item.unit || 'unit'} • Price: ${item.variant_json?.unit_price || 0}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={quantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          placeholder="0"
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {quantities[item.id] > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 text-right">
                        <span className="text-sm font-medium text-slate-700">
                          Subtotal: ${((item.variant_json?.unit_price || 0) * quantities[item.id]).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedItems.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Estimated Total Value:</span>
                    <span className="text-2xl font-bold text-slate-900">${totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToReview}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  Please review your commitment carefully. By proceeding, you will create a conditional purchase agreement (Need Deed) that becomes binding if the campaign succeeds.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-600">
                        {quantities[item.id]} × ${item.variant_json?.unit_price || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        ${((item.variant_json?.unit_price || 0) * quantities[item.id]).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold text-slate-900">Total Value:</span>
                  <span className="text-2xl font-bold text-slate-900">${totalValue.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setStep('quantities')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToSignature}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Proceed to Signature
                </button>
              </div>
            </div>
          )}

          {step === 'signature' && (
            <div>
              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Need Deed Terms</h3>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-sm space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">1. Nature of Agreement</h4>
                    <p className="text-slate-700">
                      This is a conditional purchase agreement. Your commitment becomes binding only upon assignment to a supplier through the campaign process.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">2. Items Committed</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {selectedItems.map(item => (
                        <li key={item.id}>
                          {item.title}: {quantities[item.id]} {item.unit || 'units'}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">3. Conditional Enforceability</h4>
                    <p className="text-slate-700">
                      This agreement becomes enforceable only if: (a) the campaign reaches its defined threshold, (b) a supplier accepts the terms, and (c) this agreement is assigned to that supplier via an Assignment Deed.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">4. Assignment Consent</h4>
                    <p className="text-slate-700">
                      You explicitly consent to the assignment of this agreement to a supplier selected through the campaign process, and waive any requirement for re-signature upon assignment.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">5. Expiry</h4>
                    <p className="text-slate-700">
                      This agreement expires automatically if campaign thresholds are not met or no assignment occurs within the defined period.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-blue-900">
                    I have read and agree to the terms of this Need Deed. I understand this is a conditional purchase agreement that becomes binding upon assignment.
                  </span>
                </label>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  onClick={handleSign}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing...' : 'Sign Deed'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Need Deed Signed Successfully!
              </h3>
              <p className="text-slate-600 mb-8">
                Your commitment has been recorded. You can view and download your deed from your workspace.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                {deedId && (
                  <a
                    href={`/workspace/deeds/${deedId}`}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Deed
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
