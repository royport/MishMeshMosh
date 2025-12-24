'use client';

export default function CampaignItems({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No items defined for this campaign
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Unit</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className={index !== items.length - 1 ? 'border-b border-slate-100' : ''}>
              <td className="py-4 px-4">
                <div className="font-medium text-slate-900">{item.title}</div>
                {item.item_code && (
                  <div className="text-xs text-slate-500 mt-1">SKU: {item.item_code}</div>
                )}
              </td>
              <td className="py-4 px-4 text-slate-600">{item.description || '-'}</td>
              <td className="py-4 px-4 text-slate-600">{item.unit || 'unit'}</td>
              <td className="py-4 px-4 text-right font-medium text-slate-900">
                {item.variant_json?.unit_price
                  ? `$${parseFloat(item.variant_json.unit_price).toFixed(2)}`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
