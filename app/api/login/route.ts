import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 查資料庫，找這個 username
    const [rows]: [any[], any] = await db.query(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return new Response('找不到帳號', { status: 401 });
    }

    const user = rows[0];

    // 比對密碼（目前明文比對）
    if (user.password !== password) {
      return new Response('密碼錯誤', { status: 401 });
    }

    // 密碼正確 ➔ 設定Cookie
    const cookie = serialize('adminToken', 'valid', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 2, // 2小時有效
    });

    return new Response('登入成功', {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('登入錯誤', error);
    return new Response('伺服器錯誤', { status: 500 });
  }
}
