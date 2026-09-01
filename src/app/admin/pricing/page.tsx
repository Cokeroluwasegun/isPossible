import { cn, formatCurrency } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { PricingClient } from './PricingClient';

interface PricingItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  base_price: number;
  markup_pct: number;
  description: string | null;
}

export default async function PricingPage() {
  const supabase = createServerSupabaseClient();

  const { data: items } = await supabase
    .from('pricing_items')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  const pricingItems: PricingItem[] = items || [];

  return <PricingClient initialItems={pricingItems} />;
}