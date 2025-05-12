import { cookies } from 'next/headers';

export async function checkLogin() {
  const cookieStore = await cookies();  // 👈 加await！
  const token = cookieStore.get('adminToken');

  return token?.value === 'valid';
}
