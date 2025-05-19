// 從 Next.js 的 headers 套件取得 cookies 函式（伺服端讀取 cookie）
import { cookies } from 'next/headers';
// redirect 函式用於伺服端重新導向頁面
import { redirect } from 'next/navigation';

import '@/app/globals.css'; // 全站樣式
import AdminLayout from '@/components/admin/AdminLayout'; // 自定義後台版型元件

// 設定此 layout 的 HTML metadata（可供 SEO 與瀏覽器使用）
export const metadata = {
  title: '後台管理系統',
  description: '僅供管理員使用',
};

// 後台的主要 Layout 元件（包覆所有 /admin 底下頁面）
// 使用 Server Component，因此可以直接 await cookies()
export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies(); // 取得 cookie 物件
  const token = cookieStore.get('admin-auth'); // 從 cookie 中取出登入驗證 token（key 為 'admin-auth'）

  console.log('🧠 SSR Layout Loaded'); // 伺服端日誌，可用於確認 SSR 是否執行

  // 若未登入（token 不存在或值不為 '1'），導向登入頁
  if (!token || token.value !== '1') {
    redirect('/login');
  }

  // 登入成功時，渲染後台 Layout 並嵌入子頁面
  return <AdminLayout>{children}</AdminLayout>;
}
