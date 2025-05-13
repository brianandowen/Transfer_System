'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDepartmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    department_id: '',
    department_name: '',
    category: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // 自動取得下一個 ID
  useEffect(() => {
    async function fetchNextId() {
      try {
        const res = await fetch('/api/departments/next-id');
        const data = await res.json();
        setForm((f) => ({ ...f, department_id: data.next_id }));
      } catch (err) {
        console.error('❌ 無法取得下一個 ID:', err);
        alert('🚨 無法載入下一個系所編號');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNextId();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.department_id || isLoading) {
      alert('🚫 系所 ID 尚未載入完成，請稍後再試');
      return;
    }

    const payload = {
      ...form,
      department_id: Number(form.department_id),
    };

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ 新增成功');
        router.push(`/admin/mbti-recommendations/new?department_id=${form.department_id}`);
      } else {
        alert('❌ 新增失敗：' + (data.message || '未知錯誤'));
      }
    } catch (error) {
      alert('🚨 系統錯誤，請稍後再試');
      console.error('❌ 新增錯誤:', error);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-blue-300 mb-6">新增系所</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-700 p-6 rounded-lg"
      >
        <div>
          <label className="block mb-1">系所 ID</label>
          <input
            type="number"
            name="department_id"
            value={form.department_id}
            readOnly
            placeholder="自動生成中..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-gray-400"
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
            <option value="文學與人文學群">文學與人文學群</option>
            <option value="跨領域學群">跨領域學群</option>
            <option value="藝術學群">藝術學群</option>
            <option value="教育學群">教育學群</option>
            <option value="醫藥衛生學群">醫藥衛生學群</option>
            <option value="社會與心理學群">社會與心理學群</option>
            <option value="外語學群">外語學群</option>
            <option value="商業與管理學群">商業與管理學群</option>
            <option value="生活科學學群">生活科學學群</option>
            <option value="法律與政治學群">法律與政治學群</option>
            <option value="資訊與工程學群">資訊與工程學群</option>
            <option value="數理化學群">數理化學群</option>
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
