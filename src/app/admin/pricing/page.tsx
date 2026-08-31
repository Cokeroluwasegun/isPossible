import { createServerSupabaseClient } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, DollarSign, Package } from 'lucide-react';

export default async function PricingPage() {
  const supabase = createServerSupabaseClient();

  const { data: items } = await supabase
    .from('pricing_items')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  interface PricingItem {
    id: string;
    category: string;
    name: string;
    unit: string;
    base_price: number;
    markup_pct: number;
    description: string | null;
  }

  // Group by category
  const grouped = items?.reduce((acc: Record<string, PricingItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  const unitPrice = (item: PricingItem) => item.base_price * (1 + item.markup_pct / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Pricing Catalog
          </h1>
          <p className="text-gray-500 mt-1">Manage line items, categories, and markup percentages</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b font-semibold text-gray-900 flex items-center justify-between">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            {category} ({categoryItems.length} items)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Markup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoryItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.base_price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.markup_pct}%</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(unitPrice(item))}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}