'use client'; // ✅ 宣告為 client component，才能使用 hooks（如 usePathname）

import Link from 'next/link';                 // ✅ 用於頁面內部導覽（不重整頁面）
import { usePathname } from 'next/navigation'; // ✅ 取得當前頁面路徑，用於高亮選單


// ✅ 管理後台共用排版元件，所有 admin 子頁面都會包在這裡顯示
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // 🔍 取得目前的 URL 路徑（例如 /admin）

  // ✅ 定義側邊欄導覽項目
  const navItems = [
    { name: '📋 轉系資訊管理', path: '/admin' },
    { name: '📆 轉系時程管理', path: '/admin/schedule' },
  ];

  // ✅ 處理登出邏輯
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' }); // 呼叫 API 清除 cookie
      window.location.href = '/login';                // 強制跳轉至登入頁
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };


  return (
    <div className="flex min-h-screen text-white">
      {/* ✅ 左側 Sidebar 區塊 */}
      <aside className="w-64 bg-gray-900 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-blue-300 mb-8">管理後台</h1>

        {/* ✅ 產生選單項目：根據 pathname 判斷是否加上 active 樣式 */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-4 py-2 rounded-md transition ${
              pathname === item.path
                ? 'bg-blue-500 text-blue-900 font-semibold' // 🔷 目前頁面：背景高亮
                : 'hover:bg-gray-800 text-gray-300'         // 🔘 其他頁面：滑過變色
            }`}
          >
            {item.name}
          </Link>
        ))}

        {/* ✅ 登出按鈕（會觸發 POST /api/logout 並跳轉） */}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 rounded-md transition hover:bg-gray-800 text-gray-300"
        >
          🔒 登出
        </button>
      </aside>

      {/* ✅ 右側內容呈現區：放入子元件頁面內容 */}
      <main className="flex-1 bg-gray-800 p-8">{children}</main>
    </div>
  );
}
