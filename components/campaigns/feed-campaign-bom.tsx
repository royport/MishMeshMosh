'use client';

interface BOMItem {
  item_id: string;
  item_code: string;
  item_title: string;
  item_description: string;
  unit: string;
  total_quantity: number;
  backer_count: number;
}

export default function FeedCampaignBOM({ bom }: { bom: BOMItem[] }) {
  if (!bom || bom.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <p className="text-slate-500">No items in this campaign.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Bill of Materials (BOM)</h2>
        <p className="text-sm text-slate-600 mt-1">
          Aggregated demand from {bom.reduce((sum, item) => sum + item.backer_count, 0)} total backers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Item Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Total Quantity
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Backers
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {bom.map((item) => (
              <tr key={item.item_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono font-medium text-slate-900">
                    {item.item_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{item.item_title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600 max-w-md">
                    {item.item_description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-lg font-bold text-blue-600">
                    {item.total_quantity.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm text-slate-600">{item.unit}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-medium text-slate-700">
                    {item.backer_count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Total Items:</span>
          <span className="text-sm font-bold text-slate-900">{bom.length}</span>
        </div>
      </div>
    </div>
  );
}
