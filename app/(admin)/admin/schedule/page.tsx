'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TransferScheduleForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    academic_year: '',
    apply_period: '',
    document_deadline: '',
    announcement_date: '',
    announcement_link: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/transfer-schedule');
        const data = await res.json();

        setForm({
          academic_year: data.academic_year || '',
          apply_period: data.apply_period || '',
          document_deadline: data.document_deadline || '',
          announcement_date: data.announcement_date || '',
          announcement_link: data.announcement_link || '',
        });
      } catch (err) {
        setError('⚠️ 無法載入資料');
      }
    }

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/transfer-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.message || '❌ 儲存失敗');
      }
    } catch (err) {
      setError('🚨 系統錯誤，請稍後再試');
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-blue-300 mb-4">轉系時程設定</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">✅ 儲存成功</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-700 p-6 rounded-lg">
        <div>
          <label className="block mb-1">學年度</label>
          <input
            type="text"
            name="academic_year"
            value={form.academic_year}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">線上申請期間</label>
          <input
            type="text"
            name="apply_period"
            value={form.apply_period}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">繳交資料截止日</label>
          <input
            type="text"
            name="document_deadline"
            value={form.document_deadline}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">名單公告日</label>
          <input
            type="text"
            name="announcement_date"
            value={form.announcement_date}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">原始公告連結</label>
          <input
            type="url"
            name="announcement_link"
            value={form.announcement_link}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="https://..."
          />
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
