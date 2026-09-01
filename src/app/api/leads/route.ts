import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('ghl_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Fetch leads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, source, budget_range, timeline, project_type, notes, status } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('ghl_leads')
      .insert({
        name,
        email,
        phone,
        address,
        source: source || 'other',
        budget_range: budget_range || null,
        timeline: timeline || null,
        project_type: project_type || null,
        notes: notes || null,
        status: status || 'new',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: data });
  } catch (error: any) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}