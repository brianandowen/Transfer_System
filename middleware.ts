import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isAdmin = req.cookies.get('admin-auth')?.value === '1';

  // 如果是 /admin 或 /admin/xxx，但未登入
  if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
