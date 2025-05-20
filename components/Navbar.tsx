'use client'; // ✅ 此元件為 client component，需使用 hooks（如 useEffect、usePathname）

import Link from 'next/link';                 // ✅ 用於頁面內部跳轉，不會觸發整頁重新載入
import { usePathname } from 'next/navigation'; // ✅ 取得目前頁面的 URL 路徑，用來判斷高亮選單
import { useEffect, useState } from 'react';   // ✅ 使用 useState 與 useEffect 管理主題與掛載狀態

// ✅ 預先定義導覽列上的項目與對應連結
const navItems = [
  { name: '轉系時程', href: '/schedule' },
  { name: '學系指南', href: '/department-guide' },
  { name: 'MBTI 選擇器', href: '/mbti-selector' },
  { name: 'AI 工具', href: '/ai-tool' },
  { name: '登入', href: '/login' },
];

// ✅ Navbar 元件：轉系平台的全站導覽列
export default function Navbar() {
  const pathname = usePathname();             // 📍 取得當前頁面路徑（如 /mbti-selector）
  const [isDark, setIsDark] = useState(false);      // 🌙 是否為暗色主題
  const [hasMounted, setHasMounted] = useState(false); // ✅ 是否已掛載（防止 hydration mismatch）

  // ✅ 初次載入時讀取 localStorage，套用使用者選擇的主題
  useEffect(() => {
    const theme = localStorage.getItem('theme'); // 讀取儲存的主題
    if (theme === 'dark') {
      setIsDark(true);                           // 如果是暗色就設為 true
    }
    setHasMounted(true);                         // ✅ 標記為已掛載（避免 server/client 不一致）
  }, []);

  // ✅ 主題切換函式（light ↔ dark）
  const toggleTheme = () => {
    const html = document.documentElement;       // 抓取 <html> 標籤
    const newTheme = isDark ? 'light' : 'dark';  // 切換邏輯
    html.classList.toggle('dark');               // 加上或移除 dark class
    localStorage.setItem('theme', newTheme);     // 儲存使用者選擇
    setIsDark(!isDark);                          // 更新狀態
  };

  return (
    // ✅ 整個導覽列區塊（固定在頂部 + 模糊背景 + 邊框）
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* 🎓 左側 Logo / 標題 */}
        <Link href="/" className="text-xl font-bold text-blue-700 dark:text-blue-300">
          🎓 轉系平台
        </Link>

        {/* 🔗 右側導覽列項目清單 */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-md transition ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white' // ✅ 高亮當前頁面
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700' // ✅ 其他頁面 hover 效果
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
