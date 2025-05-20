// /app/(admin)/admin/logout/route.ts

// ✅ 引入 Next.js 的伺服端回應工具
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // ✅ 引入型別（請求物件的型別）

// ✅ 登出功能的 API Route（處理 GET 請求）
export async function GET(request: NextRequest) {
  // ✅ 建立一個重導回首頁的回應
  const response = NextResponse.redirect(new URL('/', request.url));

  // ✅ 清除名為 adminToken 的 cookie
  // 設定空值 + expires 設為過去時間以達成刪除效果
  response.cookies.set('adminToken', '', {
    path: '/',                // ✅ 作用於整個網站
    expires: new Date(0),     // ✅ 設定為 1970，讓 cookie 立即失效
  });

  // ✅ 回傳最終的重導與清除 cookie 的回應
  return response;
}
