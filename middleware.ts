// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-auth')?.value;

  // ✅ 如果是 /admin 開頭，且沒有登入 token，重導向 /login
  if (request.nextUrl.pathname.startsWith('/admin') && token !== '1') {
    console.warn('⛔ middleware 阻擋未授權訪問:', request.nextUrl.pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ✅ 這裡設定要攔截的路徑
export const config = {
  matcher: ['/admin/:path*'],
};
