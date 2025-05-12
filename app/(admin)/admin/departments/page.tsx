'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDepartmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    department_id: '',
    department_name: '',
    category: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ 新增成功');
        router.push('/admin/departments');
      } else {
        alert('❌ 新增失敗：' + data.message);
      }
    } catch (error) {
      alert('🚨 系統錯誤，請稍後再試');
      console.error('❌ 新增錯誤:', error);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-blue-300 mb-6">新增系所</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-700 p-6 rounded-lg">
        <div>
          <label className="block mb-1">系所 ID</label>
          <input
            type="number"
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block mb-1">系所名稱</label>
          <input
            type="text"
            name="department_name"
            value={form.department_name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block mb-1">學群類別</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            required
          >
            <option value="">請選擇</option>
            <option value="文學院">文學院</option>
            <option value="理學院">理學院</option>
            <option value="工學院">工學院</option>
            <option value="商學院">商學院</option>
            <option value="醫學院">醫學院</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          儲存
        </button>
      </form>
    </div>
  );
}
