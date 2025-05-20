// ✅ 宣告這是 client component，才能使用 useEffect 與存取瀏覽器 API（如 localStorage、window）
'use client';

import { useEffect } from 'react'; // ✅ 引入 React 的副作用 hook（componentDidMount 行為）

// ✅ ThemeWrapper 是一個包裹元件，用來在畫面初次渲染時判斷是否啟用 dark mode
export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 🌙 從 localStorage 讀取儲存的主題設定
    const saved = localStorage.getItem('theme'); // 可能為 'dark'、'light' 或 null（未設定）

    // 🌗 若使用者沒明確設定，則依作業系統偏好判斷（瀏覽器支援 prefers-color-scheme）
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // ✅ 判斷是否應使用暗色主題
    const shouldUseDark = saved === 'dark' || (!saved && prefersDark);

    // ✅ 將結果套用至 <html> 標籤上（Tailwind 的 dark class 模式）
    if (shouldUseDark) {
      document.documentElement.classList.add('dark'); // 加上 dark class：啟用暗色模式
    } else {
      document.documentElement.classList.remove('dark'); // 拿掉 dark class：切回亮色模式
    }
  }, []); // ✅ 僅在 component mount 時執行一次
  // ✅ 將 children 元件包起來（不影響原本的內容結構）
  return <>{children}</>; // 🧱 實際會顯示的內容（例如 <Navbar />、<main /> 等）
}
