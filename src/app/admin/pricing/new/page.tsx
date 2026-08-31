'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Plants & Trees',
  'Hardscaping',
  'Irrigation',
  'Lighting',
  'Drainage',
  'Maintenance',
  'Other',
];

const UNITS = [
  'each',
  'sq ft',
  'linear ft',
  'cubic yd',
  'hour',
  'day',
  'week',
  'month',
  'allowance',
];

export default function NewPricingItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    unit: '',
    base_price: '',
    markup_pct: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          name: formData.name,
          unit: formData.unit,
          base_price: parseFloat(formData.base_price),
          markup_pct: parseFloat(formData.markup_pct) || 0,
          description: formData.description || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create pricing item');
        setIsLoading(false);
        return;
      }

      router.push('/admin/pricing');
      router.refresh();
    } catch (err) {
      setError('Failed to create pricing item');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/pricing"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft size={18} />
            Back to Pricing
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Pricing Item</h1>
          <p className="text-gray-500 mt-1">Create a new line item for the pricing catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Other">Other (custom)</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder='e.g., Red Maple 2" Calipers'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select unit</option>
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="markup_pct" className="block text-sm font-medium text-gray-700 mb-1">
                Markup % <span className="text-red-500">*</span>
              </label>
<input
              type="number"
              id="markup_pct"
              name="markup_pct"
              value={formData.markup_pct}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
              placeholder="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculated Unit Price
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">
                  {formData.base_price && formData.markup_pct
                    ? `$${(parseFloat(formData.base_price) * (1 + parseFloat(formData.markup_pct) / 100)).toFixed(2)}`
                    : '$0.00'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description for this item..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href="/admin/pricing"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <X size={16} className="inline mr-1" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}