import './globals.css';
import ThemeWrapper from '@/components/ThemeWrapper';
import NavbarWrapper from '@/components/NavbarWrapper';

export const metadata = {
  title: '轉系系統',
  description: '全站共用敘述',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <ThemeWrapper>
          <NavbarWrapper />
          {children}
        </ThemeWrapper>
      </body>
    </html>
  );
}
