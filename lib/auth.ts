// ✅ 引入 Next.js 提供的 cookies 函式，用於在伺服器端讀取 cookies（支援 SSR）
import { cookies } from 'next/headers';
// ✅ 定義一個 async 函式 checkLogin，用來判斷管理員是否登入
export async function checkLogin() {
  // ✅ 取得 cookie 儲存物件（新版 Next.js 中 cookies() 回傳的是 Promise）
  const cookieStore = await cookies(); // ⚠️ 要加 await，否則是未解構的 Promise 物件

  // ✅ 從 cookie 中取得名為 "admin-auth" 的值（登入 API 中所設定的 cookie 名）
  const token = cookieStore.get('admin-auth');

  // ✅ 若值為 '1'，代表使用者已登入，回傳 true；否則為 false
  return token?.value === '1';
}
