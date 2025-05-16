'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const mbtiTypes = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

type Entry = {
  department_id: string;
  mbti_type: string;
  recommend_type: 'suitable' | 'unsuitable';
  reason: string;
};

export default function MBTIRecommendationsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const department_id = searchParams.get('department_id') || '';

  const [suitableMBTIs, setSuitableMBTIs] = useState<string[]>(['']);
  const [unsuitableMBTIs, setUnsuitableMBTIs] = useState<string[]>(['']);
  const [suitableReason, setSuitableReason] = useState('');
  const [unsuitableReason, setUnsuitableReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const addField = (type: 'suitable' | 'unsuitable') => {
    if (type === 'suitable') setSuitableMBTIs([...suitableMBTIs, '']);
    else setUnsuitableMBTIs([...unsuitableMBTIs, '']);
  };

  const updateMBTI = (type: 'suitable' | 'unsuitable', index: number, value: string) => {
    const updater = type === 'suitable' ? [...suitableMBTIs] : [...unsuitableMBTIs];
    updater[index] = value;
    type === 'suitable' ? setSuitableMBTIs(updater) : setUnsuitableMBTIs(updater);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('🔍 導向目標 ID =', department_id);
    const filteredSuitable = suitableMBTIs.filter(Boolean);
    const filteredUnsuitable = unsuitableMBTIs.filter(Boolean);

    if (filteredSuitable.length === 0 || filteredUnsuitable.length === 0) {
      setError('請至少選擇一個「適合」與一個「不適合」的 MBTI 類型');
      return;
    }

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

    try {
      const res = await fetch('/api/mbti-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        router.push(`/admin/departments/${department_id}/edit`);      
      } else {
        setError(data.message || '儲存失敗');
      }
    } catch (err) {
      setError('無法儲存資料，請稍後再試');
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-blue-300 mb-4">MBTI 推薦設定</h1>
      <p className="mb-4 text-gray-300">系所 ID: {department_id}</p>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">✅ 儲存成功</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 適合區塊 */}
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

        {/* 不適合區塊 */}
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

        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          儲存設定
        </button>
      </form>
    </div>
  );
}
