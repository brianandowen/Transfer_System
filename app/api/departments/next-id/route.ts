import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('departments')
    .select('department_id')
    .order('department_id', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const nextId = data && data.length > 0 ? data[0].department_id + 1 : 1;

  return NextResponse.json({ nextId });
}
