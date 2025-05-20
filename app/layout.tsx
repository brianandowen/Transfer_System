// ✅ 匯入全站共用樣式（Tailwind 或自定義 CSS）
import './globals.css';

// ✅ 引入主題管理元件（處理暗/亮模式套用）
import ThemeWrapper from '@/components/ThemeWrapper';

// ✅ 引入全站導覽列元件（含主選單/Logo 等）
import NavbarWrapper from '@/components/NavbarWrapper';


// ✅ 定義全站的 HTML metadata，會套用到 <head>
export const metadata = {
  title: '轉系系統',           // 頁面標題（顯示在瀏覽器分頁）
  description: '全站共用敘述', // 預設 SEO 敘述
};

// ✅ 全站共用 Layout 元件（所有 page.tsx 都會被包在這裡）
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning> 
      {/* lang="zh-TW"：設定為繁體中文語系，利於 SEO 與輔助工具辨識語言 */}
      {/* suppressHydrationWarning：避免暗/亮主題初始 hydration 警告 */}

      <body>
        <ThemeWrapper> {/* ✅ 包住整個 body，確保主題狀態能套用至所有元件 */}
          <NavbarWrapper /> {/* ✅ 全站共用導覽列：會出現在所有畫面頂部 */}
          {children}        {/* ✅ 動態插入對應 route 的內容頁面 */}
        </ThemeWrapper>
      </body>
    </html>
  );
}

