'use client'; // 宣告為 Client Component，可使用 useState、useRouter 等 hook

import { useRouter } from 'next/navigation'; // 用來做頁面導向
import { useState } from 'react';

export default function Login() {
  const router = useRouter(); // 初始化 router
  const [form, setForm] = useState({ username: '', password: '' }); // 儲存帳號與密碼輸入值
  const [error, setError] = useState(''); // 顯示錯誤訊息

  // 處理輸入欄位變動
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 處理表單提交（登入動作）
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表單預設行為
    setError(''); // 清空錯誤訊息

    // 發送 POST 請求到 /api/login
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/admin'); // 登入成功導向後台
    } else {
      setError('帳號或密碼錯誤'); // 登入失敗顯示錯誤
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf2fc] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          🔐 後台登入
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 使用者帳號欄位 */}
          <input
            type="text"
            name="username"
            placeholder="請輸入帳號"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {/* 使用者密碼欄位 */}
          <input
            type="password"
            name="password"
            placeholder="請輸入密碼"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {/* 錯誤訊息顯示 */}
          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}
          {/* 登入按鈕 */}
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
          >
            登入
          </button>
        </form>
      </div>
    </div>
  );
}
