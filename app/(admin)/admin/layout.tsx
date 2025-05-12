import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import '@/app/globals.css';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: '後台管理系統',
  description: '僅供管理員使用',
};

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies(); // ✅ 加 await
  const token = cookieStore.get('adminToken');

  if (!token || token.value !== 'valid') {
    redirect('/login');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
