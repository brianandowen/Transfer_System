'use client'; // 宣告為 Client Component，才能使用 useState、useEffect、useRouter 等瀏覽器端功能

import { useSearchParams } from 'next/navigation'; // 若未來從 URL 取 query 參數時可使用（目前沒用）
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 用於跳轉頁面

export default function TransferScheduleForm() {
  const router = useRouter(); // 初始化 router，供儲存後跳轉回 /admin

  // 表單狀態：紀錄五個欄位內容
  const [form, setForm] = useState({
    academic_year: '',          // 學年度
    apply_period: '',           // 線上申請期間
    document_deadline: '',      // 繳交資料截止日
    announcement_date: '',      // 名單公告日
    announcement_link: '',      // 公告網址（非必填）
  });

  // 錯誤訊息與儲存成功提示狀態
  const [error, setError] = useState('');      // 出現錯誤時顯示錯誤文字
  const [success, setSuccess] = useState(false); // 儲存成功時顯示成功提示

  // 🔃 初次進入頁面時，載入現有的時程資料填入表單
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/transfer-schedule'); // 向 API 發送 GET 請求
        const data = await res.json(); // 解析結果 JSON

        // 將取得的資料填入表單（若某欄位不存在則填空字串）
        setForm({
          academic_year: data.academic_year || '',
          apply_period: data.apply_period || '',
          document_deadline: data.document_deadline || '',
          announcement_date: data.announcement_date || '',
          announcement_link: data.announcement_link || '',
        });
      } catch (err) {
        // 若 API 請求失敗，顯示錯誤訊息
        setError('⚠️ 無法載入資料');
      }
    }

    fetchData();
  }, []);

  // 🖊️ 處理輸入框內容變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // 取得欄位名稱與值
    setForm({ ...form, [name]: value }); // 更新對應欄位
  };

  // ✅ 表單送出時呼叫 POST API 儲存資料
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();       // 阻止表單預設行為
    setError('');             // 清空錯誤訊息
    setSuccess(false);        // 清除成功提示

    try {
      const res = await fetch('/api/transfer-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form), // 將表單資料轉為 JSON
      });

      if (res.ok) {
        setSuccess(true);     // 顯示成功提示
        router.push('/admin'); // 跳轉回後台首頁
      } else {
        const data = await res.json(); // 讀取錯誤訊息
        setError(data.message || '❌ 儲存失敗'); // 顯示錯誤訊息
      }
    } catch (err) {
      setError('🚨 系統錯誤，請稍後再試'); // 捕捉網路錯誤或例外狀況
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-blue-300 mb-4">轉系時程設定</h1>

      {/* 🔴 錯誤提示區塊（若 error 不為空） */}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* ✅ 成功提示區塊 */}
      {success && <p className="text-green-400 mb-4">✅ 儲存成功</p>}

      {/* 📝 表單開始 */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-700 p-6 rounded-lg">
        {/* 學年度欄位 */}
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

        {/* 線上申請期間 */}
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

        {/* 繳交資料截止日 */}
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

        {/* 名單公告日 */}
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

        {/* 原始公告連結（非必填） */}
        <div>
          <label className="block mb-1">原始公告連結</label>
          <input
            type="url"
            name="announcement_link"
            value={form.announcement_link}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </div>

        {/* 儲存按鈕 */}
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
