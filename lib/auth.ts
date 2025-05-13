import { cookies } from 'next/headers';

export async function checkLogin() {
  const cookieStore = await cookies(); // ✅ 加 await，因為是 Promise
  const token = cookieStore.get('admin-auth'); // ✅ 名稱對應 API

  return token?.value === '1';
}
