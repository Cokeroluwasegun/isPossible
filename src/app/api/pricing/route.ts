import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const PricingItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  unit: z.string().min(1, 'Unit is required'),
  base_price: z.number().min(0, 'Base price must be non-negative'),
  markup_pct: z.number().min(0, 'Markup percentage must be non-negative').default(0),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('pricing_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Fetch pricing items error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const parsed = PricingItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('pricing_items')
      .insert({
        category: parsed.data.category,
        name: parsed.data.name,
        unit: parsed.data.unit,
        base_price: parsed.data.base_price,
        markup_pct: parsed.data.markup_pct || 0,
        description: parsed.data.description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    console.error('Create pricing item error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const UpdatePricingSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  category: z.string().optional(),
  name: z.string().optional(),
  unit: z.string().optional(),
  base_price: z.number().min(0).optional(),
  markup_pct: z.number().min(0).optional(),
  description: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    const parsed = UpdatePricingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { id, ...updates } = parsed.data;
    const supabase = createServerSupabaseClient();

    const updateData: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    // Only include fields that are defined (not undefined)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const { data, error } = await supabase
      .from('pricing_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    console.error('Update pricing item error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('pricing_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete pricing item error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}