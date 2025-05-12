import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data || data.password !== password) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  }

  const res = NextResponse.json({ message: '登入成功' });

  res.headers.set(
    'Set-Cookie',
    serialize('admin-auth', '1', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 2,
    })
  );

  return res;
}
