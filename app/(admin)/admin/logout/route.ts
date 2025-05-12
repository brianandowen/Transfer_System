// /app/(admin)/admin/logout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));

  // 清除 adminToken cookie，設過去時間保險清除
  response.cookies.set('adminToken', '', {
    path: '/',
    expires: new Date(0),
  });

  return response;
}
