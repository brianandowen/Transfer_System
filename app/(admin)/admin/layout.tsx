import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import '@/app/globals.css';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: '後台管理系統',
  description: '僅供管理員使用',
};

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-auth'); // ✅ 改為正確名稱

  if (!token || token.value !== '1') {         // ✅ 改為正確值
    redirect('/login');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
