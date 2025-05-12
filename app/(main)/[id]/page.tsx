'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/conditions');
      const all = await res.json();
      const dept = all.find((item: any) => item.department_id.toString() === id);
      setData(dept || null);
      setLoading(false);
    }

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-500 dark:text-gray-300">🔄 載入中...</div>;
  if (!data) return <div className="text-center py-16 text-red-500 dark:text-red-300">🚫 找不到該系所資料</div>;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-block bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-4 py-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition"
        >
          ← 返回上一頁
        </button>

        {/* 標題 */}
        <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2">
          {data.department_name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">轉系資訊詳細說明</p>

        {/* 區塊一：轉入年級與名額 */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">🎯 轉入年級與名額</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200">
            {data.quotas.map((q: any) => (
              <li key={q.grade}>{q.grade} 年級 — {q.quota} 名</li>
            ))}
          </ul>
        </section>

        {/* 區塊二：考試科目 */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">📝 考試科目</h2>
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-200">{data.exam_subjects}</p>
        </section>

        {/* 區塊三：成績比例 */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">📊 成績比例</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200">
            {Object.entries(data.score_ratio).map(([key, value]: any) => (
              <li key={key}>{key}：{value}%</li>
            ))}
          </ul>
        </section>

        {/* 區塊四：備註 */}
        {data.remarks && (
          <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-600 p-5 rounded-xl shadow mt-6">
            <h3 className="font-bold text-lg mb-2">📌 備註</h3>
            <p className="text-sm whitespace-pre-line">{data.remarks}</p>
          </div>
        )}
      </div>
    </main>
  );
}
