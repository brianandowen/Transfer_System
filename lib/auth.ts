import { cookies } from 'next/headers';

export async function checkLogin() {
  const cookieStore = cookies(); // ❌ 不需要 await，這不是 async function
  const token = cookieStore.get('admin-auth'); // ✅ 名稱要一致

  return token?.value === '1'; // ✅ 判斷值也一致
}
