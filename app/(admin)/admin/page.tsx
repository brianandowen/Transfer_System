'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Department = {
  department_id: number;
  department_name: string;
  category: string;
};

export default function DepartmentListPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        setDepartments(data.departments || data || []); // ✅ 防止 undefined
      } catch (err) {
        console.error('❌ 系所資料載入失敗:', err);
        setDepartments([]);
        setError(true); // ✅ 顯示錯誤狀態
      }
    }

    fetchDepartments();
  }, []);

  const filtered = departments.filter((dep) =>
    dep.department_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-300">轉系資訊管理</h1>
        <button
          onClick={() => router.push('/admin/departments/new')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
        >
          ➕ 新增系所
        </button>
      </div>

      {/* Search bar */}
      <input
        className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="搜尋系所名稱..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Department list */}
      {error ? (
        <p className="text-red-400">⚠️ 無法載入系所資料，請稍後再試。</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dep) => (
            <div
              key={dep.department_id}
              onClick={() =>
                router.push(`/admin/departments/${dep.department_id}/edit`)
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
