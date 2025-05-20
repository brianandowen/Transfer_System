import { NextResponse } from 'next/server';           // ✅ 用來建立 HTTP 回應
import type { NextRequest } from 'next/server';       // ✅ 型別定義：進來的 request 物件

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));

  // 清除 admin-auth cookie
  response.cookies.set('admin-auth', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
