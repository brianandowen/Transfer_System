'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: '📋 轉系資訊管理', path: '/admin' },
    { name: '📆 轉系時程管理', path: '/admin/schedule' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-blue-300 mb-8">管理後台</h1>

        {/* 導覽項目 */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-4 py-2 rounded-md transition ${
              pathname === item.path
                ? 'bg-blue-500 text-blue-900 font-semibold'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            {item.name}
          </Link>
        ))}

        {/* 登出按鈕 */}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 rounded-md transition hover:bg-gray-800 text-gray-300"
        >
          🔒 登出
        </button>
      </aside>

      {/* 內容區域 */}
      <main className="flex-1 bg-gray-800 p-8">{children}</main>
    </div>
  );
}
