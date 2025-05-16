import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
