import { useState } from 'react';
import type { CampaignFormData, CampaignItemForm } from '@/lib/types/campaign';

interface ItemsStepProps {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
}

export function ItemsStep({ formData, updateFormData }: ItemsStepProps) {
  const [editingItem, setEditingItem] = useState<CampaignItemForm>({
    item_code: '',
    title: '',
    description: '',
    unit: 'piece',
  });

  const addItem = () => {
    if (!editingItem.title.trim()) return;

    updateFormData({
      items: [
        ...formData.items,
        {
          ...editingItem,
          tempId: `temp-${Date.now()}`,
        },
      ],
    });

    setEditingItem({
      item_code: '',
      title: '',
      description: '',
      unit: 'piece',
    });
  };

  const removeItem = (index: number) => {
    updateFormData({
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Campaign Items</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Define the products or services you want to purchase. Backers will commit to specific quantities of these items.
        </p>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Add Item</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Item Code / SKU
              </label>
              <input
                type="text"
                value={editingItem.item_code}
                onChange={(e) => setEditingItem({ ...editingItem, item_code: e.target.value })}
                placeholder="e.g., LAPTOP-001"
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Unit <span className="text-error-600">*</span>
              </label>
              <select
                value={editingItem.unit}
                onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="m">Meter (m)</option>
                <option value="cm">Centimeter (cm)</option>
                <option value="l">Liter (L)</option>
                <option value="ml">Milliliter (mL)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Item Title <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              placeholder="e.g., Dell Latitude 5520 15.6 Laptop"
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              placeholder="Specifications, requirements, or additional details..."
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={!editingItem.title.trim()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Item
          </button>
        </div>
      </div>

      {formData.items.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-900 mb-3">
            Campaign Items ({formData.items.length})
          </h3>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div
                key={item.tempId || item.id || index}
                className="border border-neutral-200 rounded-lg p-4 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.item_code && (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          {item.item_code}
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {item.unit}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="ml-4 text-error-600 hover:text-error-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.items.length === 0 && (
        <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-sm text-neutral-600">No items added yet. Add your first item above.</p>
        </div>
      )}
    </div>
  );
}
