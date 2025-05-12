import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 取得所有系所
export async function GET() {
  const { data, error } = await supabase
    .from('departments')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 新增系所
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { error } = await supabase
    .from('departments')
    .insert([body]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: '新增成功' });
}
