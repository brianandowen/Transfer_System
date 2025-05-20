'use client'; // ✅ 宣告這是 Client Component，可使用 useState、useRouter 等 hook

import { useSearchParams, useRouter } from 'next/navigation'; // ✅ 用來取得 URL 參數、控制頁面跳轉
import { useState } from 'react';

// ✅ 所有可選的 MBTI 類型，共 16 種
const mbtiTypes = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

// ✅ 送出 API 的資料型別格式
type Entry = {
  department_id: string; // ✅ 系所 ID，來自網址參數
  mbti_type: string; // ✅ MBTI 類型（例如 ENFP）
  recommend_type: 'suitable' | 'unsuitable'; // ✅ 推薦分類：適合或不適合
  reason: string; // ✅ 推薦理由
};

export default function MBTIRecommendationsForm() {
  const searchParams = useSearchParams(); // ✅ 取得網址上的參數（例如 ?department_id=3）
  const router = useRouter(); // ✅ 用來進行導向操作
  const department_id = searchParams.get('department_id') || ''; // ✅ 取得系所 ID（若不存在則為空）

  // ✅ 適合與不適合的 MBTI 選擇欄位（可動態新增多欄）
  const [suitableMBTIs, setSuitableMBTIs] = useState<string[]>(['']);
  const [unsuitableMBTIs, setUnsuitableMBTIs] = useState<string[]>(['']);

  // ✅ 輸入理由欄位
  const [suitableReason, setSuitableReason] = useState('');
  const [unsuitableReason, setUnsuitableReason] = useState('');

  // ✅ 提示用狀態
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ✅ 新增一欄 MBTI 選擇欄位
  const addField = (type: 'suitable' | 'unsuitable') => {
    if (type === 'suitable') setSuitableMBTIs([...suitableMBTIs, '']);
    else setUnsuitableMBTIs([...unsuitableMBTIs, '']);
  };

  // ✅ 修改指定欄位中的 MBTI 選擇值
  const updateMBTI = (type: 'suitable' | 'unsuitable', index: number, value: string) => {
    const updater = type === 'suitable' ? [...suitableMBTIs] : [...unsuitableMBTIs];
    updater[index] = value;
    type === 'suitable' ? setSuitableMBTIs(updater) : setUnsuitableMBTIs(updater);
  };

  // ✅ 表單送出處理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ 阻止預設提交行為
    setError('');
    setSuccess(false);

    // ✅ 檢查是否有帶入系所 ID
    if (!department_id) {
      console.error('❌ department_id is missing');
      setError('無法取得系所 ID');
      return;
    }

    // ✅ 過濾掉空白欄位
    const filteredSuitable = suitableMBTIs.filter(Boolean);
    const filteredUnsuitable = unsuitableMBTIs.filter(Boolean);

    // ✅ 檢查是否至少選一個適合與不適合
    if (filteredSuitable.length === 0 || filteredUnsuitable.length === 0) {
      setError('請至少選擇一個「適合」與一個「不適合」的 MBTI 類型');
      return;
    }

    // ✅ 建立送出資料的 payload 陣列
    const payload: Entry[] = [
      ...filteredSuitable.map(mbti => ({
        department_id,
        mbti_type: mbti,
        recommend_type: 'suitable' as const,
        reason: suitableReason
      })),
      ...filteredUnsuitable.map(mbti => ({
        department_id,
        mbti_type: mbti,
        recommend_type: 'unsuitable' as const,
        reason: unsuitableReason
      }))
    ];

    console.log('📤 發送資料 payload:', payload);

    try {
      const res = await fetch('/api/mbti-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('🧾 回傳結果:', data);

      if (res.ok) {
        setSuccess(true); // ✅ 成功提示
        console.log(`✅ 成功，導向 /admin/departments/${department_id}/edit`);
        setTimeout(() => {
          router.push(`/admin/departments/${department_id}/edit`);
        }, 1000);
      } else {
        console.error('❌ 錯誤訊息:', data);
        setError(data.message || '儲存失敗（未知錯誤）');
      }
    } catch (err: any) {
      console.error('❌ 發生例外:', err);
      setError(err?.message || '無法儲存資料，請稍後再試');
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-blue-300 mb-4">MBTI 推薦設定</h1>
      <p className="mb-4 text-gray-300">系所 ID: {department_id}</p>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">✅ 儲存成功，將跳轉至條件設定...</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ 適合的 MBTI 區塊 */}
        <div className="bg-gray-700 p-4 rounded-md">
          <label className="block text-blue-200 mb-2">適合的 MBTI 類型</label>
          {suitableMBTIs.map((mbti, i) => (
            <select
              key={i}
              value={mbti}
              onChange={(e) => updateMBTI('suitable', i, e.target.value)}
              className="w-full mb-2 p-2 rounded bg-gray-800 border border-gray-600 text-white"
              required
            >
              <option value="">請選擇</option>
              {mbtiTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ))}
          <button type="button" onClick={() => addField('suitable')} className="text-blue-400 text-sm underline">＋新增一個</button>
          <textarea
            value={suitableReason}
            onChange={(e) => setSuitableReason(e.target.value)}
            placeholder="請輸入適合的理由..."
            className="mt-2 w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            required
          />
        </div>

        {/* ❌ 不適合的 MBTI 區塊 */}
        <div className="bg-gray-700 p-4 rounded-md">
          <label className="block text-blue-200 mb-2">不適合的 MBTI 類型</label>
          {unsuitableMBTIs.map((mbti, i) => (
            <select
              key={i}
              value={mbti}
              onChange={(e) => updateMBTI('unsuitable', i, e.target.value)}
              className="w-full mb-2 p-2 rounded bg-gray-800 border border-gray-600 text-white"
              required
            >
              <option value="">請選擇</option>
              {mbtiTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ))}
          <button type="button" onClick={() => addField('unsuitable')} className="text-blue-400 text-sm underline">＋新增一個</button>
          <textarea
            value={unsuitableReason}
            onChange={(e) => setUnsuitableReason(e.target.value)}
            placeholder="請輸入不適合的理由..."
            className="mt-2 w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            required
          />
        </div>

        {/* ✅ 儲存按鈕 */}
        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          儲存設定
        </button>
      </form>
    </div>
  );
}
