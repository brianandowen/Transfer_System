'use client'; // ✅ 宣告為 Client Component，可使用 useState、useEffect、useRouter 等 Hook

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDepartmentPage() {
  const router = useRouter(); // ✅ 用來導向新增後的推薦頁面

  // ✅ 表單狀態，預設值為空，id 等待 API 自動產生
  const [form, setForm] = useState({
    department_id: '',
    department_name: '',
    category: '',
  });

  const [isLoading, setIsLoading] = useState(true); // ✅ 是否正在載入 department_id

  // ✅ 初次載入頁面時，從後端 API 取得下一個可用的 ID
  useEffect(() => {
    async function fetchNextId() {
      try {
        const res = await fetch('/api/departments/next-id');
        const data = await res.json();
        setForm((f) => ({ ...f, department_id: data.next_id })); // ✅ 寫入取得的 ID
      } catch (err) {
        console.error('❌ 無法取得下一個 ID:', err);
        alert('🚨 無法載入下一個系所編號');
      } finally {
        setIsLoading(false); // ✅ 無論成功或失敗都要取消 loading 狀態
      }
    }

    fetchNextId(); // ✅ 呼叫一次
  }, []);

  // ✅ 處理輸入欄位變動（text 或 select）
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 表單提交時，POST 至 /api/departments
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 若 ID 還沒載入完成，禁止送出
    if (!form.department_id || isLoading) {
      alert('🚫 系所 ID 尚未載入完成，請稍後再試');
      return;
    }

    // ✅ 傳送前將 ID 轉為數字格式
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
        // ✅ 新增成功後導向 MBTI 推薦設定頁面
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
        {/* ✅ 顯示系所 ID（只讀欄位，自動載入） */}
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

        {/* ✅ 系所名稱輸入欄位 */}
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

        {/* ✅ 學群類別下拉選單 */}
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

        {/* ✅ 提交按鈕 */}
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
