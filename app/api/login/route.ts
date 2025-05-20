import { NextRequest, NextResponse } from 'next/server'; // ✅ 引入 Next.js 的 request/response 工具
import { supabase } from '@/lib/supabase';               // ✅ 匯入 Supabase 客戶端
import { serialize } from 'cookie';                      // ✅ 用來設定回應中的 Set-Cookie 標頭


// ✅ POST 方法：處理管理員登入邏輯
export async function POST(req: NextRequest) {
  // 📥 解析前端送來的帳號密碼
  const { username, password } = await req.json();

  // 🔍 查詢 admin_users 表格，找出該帳號的使用者資料
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .single(); // 預期帳號唯一，若查無或有多筆會報錯

  // ❌ 若查詢錯誤、找不到帳號、或密碼比對錯誤，則回傳 401
  if (error || !data || data.password !== password) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  }

  // ✅ 若帳號密碼正確，建立一個成功的 JSON 回應
  const res = NextResponse.json({ message: '登入成功' });

  // 🧠 設定登入憑證（寫入 cookie）：admin-auth = 1
  res.headers.set(
    'Set-Cookie',
    serialize('admin-auth', '1', {
      path: '/',                      // 🌍 整站皆可讀取此 cookie
      httpOnly: true,                // 🚫 無法由 JavaScript 存取（防止 XSS）
      maxAge: 60 * 60 * 2,           // 🕑 有效時間為 2 小時（以秒為單位）
      sameSite: 'lax',               // ✅ 提升跨站防護但允許內部跳轉
      secure: process.env.NODE_ENV === 'production', // ✅ 僅在部署環境啟用 HTTPS 傳送
    })
  );

  // 🔚 回傳帶有 cookie 的登入成功回應
  return res;
}

