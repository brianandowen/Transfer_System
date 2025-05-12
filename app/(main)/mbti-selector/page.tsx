'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MBTIPage() {
  const router = useRouter();
  const [mbti, setMbti] = useState({ ei: '', sn: '', tf: '', jp: '' });
  const [result, setResult] = useState('');
  const [best, setBest] = useState<any[]>([]);
  const [worst, setWorst] = useState<any[]>([]);

  const handleSelect = (dimension: string, value: string) => {
    setMbti(prev => ({ ...prev, [dimension]: value }));
  };

  const handleSubmit = async () => {
    const mbtiResult = mbti.ei + mbti.sn + mbti.tf + mbti.jp;
    if (mbtiResult.length !== 4) return alert('請完成所有選擇');

    setResult(mbtiResult);

    try {
      const res = await fetch(`/api/mbti?type=${mbtiResult}`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setBest(data.best || []);
        setWorst(data.worst || []);
      } else {
        alert('❌ 無法獲取推薦：' + (data.message || data.error));
      }
    } catch (err) {
      alert('🚨 系統錯誤');
    }
  };

  const renderDepartmentCard = (dep: any) => (
    <div
      key={dep.department_id}
      onClick={() => router.push(`/${dep.department_id}`)}
      className="cursor-pointer p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
    >
      <p className="text-blue-700 dark:text-blue-300 font-semibold text-lg">{dep.name}</p>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{dep.group_name}</p>
      <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">{dep.reason}</p>
    </div>
  );

  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 mb-6">MBTI 性格測驗</h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-6">
          {/* EI */}
          <div>
            <p className="font-semibold mb-2">你傾向於：</p>
            <div className="flex gap-4">
              <button className={`px-4 py-2 rounded-lg ${mbti.ei === 'E' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('ei', 'E')}>外向（E）</button>
              <button className={`px-4 py-2 rounded-lg ${mbti.ei === 'I' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('ei', 'I')}>內向（I）</button>
            </div>
          </div>

          {/* SN */}
          <div>
            <p className="font-semibold mb-2">你處理資訊的方式：</p>
            <div className="flex gap-4">
              <button className={`px-4 py-2 rounded-lg ${mbti.sn === 'S' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('sn', 'S')}>實感（S）</button>
              <button className={`px-4 py-2 rounded-lg ${mbti.sn === 'N' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('sn', 'N')}>直覺（N）</button>
            </div>
          </div>

          {/* TF */}
          <div>
            <p className="font-semibold mb-2">你做決策的方式：</p>
            <div className="flex gap-4">
              <button className={`px-4 py-2 rounded-lg ${mbti.tf === 'T' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('tf', 'T')}>思考（T）</button>
              <button className={`px-4 py-2 rounded-lg ${mbti.tf === 'F' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('tf', 'F')}>情感（F）</button>
            </div>
          </div>

          {/* JP */}
          <div>
            <p className="font-semibold mb-2">你對生活的態度：</p>
            <div className="flex gap-4">
              <button className={`px-4 py-2 rounded-lg ${mbti.jp === 'J' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('jp', 'J')}>判斷（J）</button>
              <button className={`px-4 py-2 rounded-lg ${mbti.jp === 'P' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} transition`} onClick={() => handleSelect('jp', 'P')}>知覺（P）</button>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition">
              查看推薦科系
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-8">
            <p className="text-2xl text-center font-bold text-blue-600 dark:text-blue-300 mt-8">你的 MBTI 結果是：{result}</p>

            {best.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-green-600 dark:text-green-400">✅ 適合的科系：</h2>
                <div className="grid grid-cols-1 gap-4">
                  {best.map(dep => renderDepartmentCard(dep))}
                </div>
              </div>
            )}

            {worst.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-red-500 dark:text-red-400">⚠️ 不適合的科系：</h2>
                <div className="grid grid-cols-1 gap-4">
                  {worst.map(dep => renderDepartmentCard(dep))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* 外部測驗連結與免責聲明 */}
<div className="max-w-3xl mx-auto mt-16 text-sm text-center text-gray-600 dark:text-gray-400 space-y-4">
  <p>
    不知道自己的 MBTI？你可以前往{" "}
    <a
      href="https://www.16personalities.com/tw/性格測試"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-300 underline hover:text-blue-800 dark:hover:text-blue-100 transition"
    >
      16Personalities 免費性格測驗
    </a>
    了解自己的類型。
  </p>
  <p className="text-xs text-gray-500 dark:text-gray-500">
    ※ 本系統僅為參考用途，推薦結果不代表官方或學校立場，請依自身興趣與專業選擇科系。
  </p>
</div>

    </main>
  );
}
