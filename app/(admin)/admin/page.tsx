'use client'; // 宣告為 Client Component，可使用 useState、useEffect、useRouter 等 hook

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 定義系所資料的型別
type Department = {
  department_id: number;
  department_name: string;
  category: string;
};

export default function DepartmentListPage() {
  const router = useRouter(); // 用於頁面跳轉
  const [departments, setDepartments] = useState<Department[]>([]); // 儲存所有系所
  const [search, setSearch] = useState(''); // 使用者輸入的搜尋字串
  const [error, setError] = useState(false); // 錯誤狀態，當 API 請求失敗時為 true

  // 初次載入時向 API 取得系所清單
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments'); // 發送請求
        const data = await res.json(); // 解析資料
        setDepartments(data.departments || data || []); // 兼容不同結構，防止 undefined
      } catch (err) {
        console.error('❌ 系所資料載入失敗:', err);
        setDepartments([]);
        setError(true); // 設定錯誤狀態
      }
    }

    fetchDepartments();
  }, []);

  // 根據使用者輸入過濾系所
  const filtered = departments.filter((dep) =>
    dep.department_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* 標題與新增按鈕 */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-300">轉系資訊管理</h1>
        <button
          onClick={() => router.push('/admin/departments/new')} // 跳轉到新增頁面
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
        >
          ➕ 新增系所
        </button>
      </div>

      {/* 搜尋欄位 */}
      <input
        className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="搜尋系所名稱..."
        value={search}
        onChange={(e) => setSearch(e.target.value)} // 當輸入變更時更新 search 狀態
      />

      {/* 系所列表或錯誤訊息 */}
      {error ? (
        <p className="text-red-400">⚠️ 無法載入系所資料，請稍後再試。</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dep) => (
            <div
              key={dep.department_id}
              onClick={() =>
                router.push(`/admin/departments/${dep.department_id}/edit`) // 點擊卡片跳轉到編輯頁面
              }
              className="cursor-pointer p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition shadow"
            >
              <h3 className="text-white text-lg font-semibold mb-1">
                {dep.department_name}
              </h3>
              <p className="text-sm text-gray-400">{dep.category}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">找不到符合條件的系所。</p>
      )}
    </div>
  );
}
