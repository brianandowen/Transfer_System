import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('departments')
    .select('department_id')
    .order('department_id', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const lastId = Number(data?.[0]?.department_id || 0);
  const next_id = lastId + 1;

  return NextResponse.json({ next_id });
}
