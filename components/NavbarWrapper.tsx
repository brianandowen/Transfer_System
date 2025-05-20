'use client'; // ✅ 指定此元件為 client component，才能使用 hooks（例如 usePathname）

import { usePathname } from 'next/navigation'; // ✅ 用於取得當前頁面路徑
import Navbar from './Navbar';                 // ✅ 引入實際的 Navbar 導覽列元件

// ✅ 外層包裝元件：決定是否要顯示 Navbar（用於條件渲染）
export default function NavbarWrapper() {
  const pathname = usePathname(); // 🔍 取得目前瀏覽的 URL 路徑，例如 "/admin"

  // ✅ 定義哪些路徑開頭的頁面要隱藏導覽列
  const hiddenPaths = ['/admin']; // 目前設定為 admin 區不顯示（例如 /admin/edit）

  // ✅ 判斷是否應該隱藏導覽列
  const shouldHide = hiddenPaths.some((path) =>
    pathname.startsWith(path) // 只要目前路徑是以指定字串開頭，就會隱藏
  );

  // ✅ 若該頁面在隱藏清單中，則不渲染 Navbar
  if (shouldHide) return null;

  // ✅ 預設情況：顯示導覽列
  return <Navbar />;
}
