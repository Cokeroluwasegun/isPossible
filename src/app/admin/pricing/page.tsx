'use client';

import { useState } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';

interface PricingItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  base_price: number;
  markup_pct: number;
  description: string | null;
}

export default function PricingPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingItem>>({});

  async function fetchItems() {
    try {
      const res = await fetch('/api/pricing');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this pricing item?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/pricing?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Failed to delete');
    } finally {
      setActionLoading(null);
    }
  }

  function startEdit(item: PricingItem) {
    setEditingId(item.id);
    setEditForm({
      category: item.category,
      name: item.name,
      unit: item.unit,
      base_price: item.base_price,
      markup_pct: item.markup_pct,
      description: item.description,
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setActionLoading(editingId);
    try {
      const res = await fetch('/api/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(prev => prev.map(item =>
          item.id === editingId ? { ...item, ...data.item } : item
        ));
        setEditingId(null);
        setEditForm({});
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (error) {
      alert('Failed to update');
    } finally {
      setActionLoading(null);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  const unitPrice = (item: PricingItem) => item.base_price * (1 + item.markup_pct / 100);

  const grouped = items.reduce((acc: Record<string, PricingItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
    'each', 'sq ft', 'linear ft', 'cubic yd', 'hour', 'day', 'week', 'month', 'allowance',
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

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
        <Link
          href="/admin/pricing/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Item
        </Link>
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
                    {editingId === item.id ? (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.category || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.unit || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            {UNITS.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.base_price || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.markup_pct || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, markup_pct: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {editForm.base_price && editForm.markup_pct
                            ? formatCurrency(editForm.base_price * (1 + editForm.markup_pct / 100))
                            : '$0.00'}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editForm.description || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={actionLoading === item.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Save"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={actionLoading === item.id}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                              title="Cancel"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.base_price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.markup_pct}%</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(unitPrice(item))}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={actionLoading === item.id}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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