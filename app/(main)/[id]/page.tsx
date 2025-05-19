'use client'; // 宣告為 Client Component，才能使用 useState、useEffect、useRouter 等 hook

import { useParams, useRouter } from 'next/navigation'; // 取得動態路由參數與導向功能
import { useEffect, useState } from 'react';

export default function DepartmentDetailPage() {
  const { id } = useParams(); // 從動態路由取得系所 id
  const router = useRouter(); // 用來做返回上一頁的導向
  const [data, setData] = useState<any | null>(null); // 儲存該系所的完整資料
  const [loading, setLoading] = useState(true); // 控制是否正在載入中

  // 元件初始化後依據 id 載入資料
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/conditions'); // 從 API 抓取全部系所資料
      const all = await res.json();
      // 根據 URL 中的 id 找出對應的系所資料
      const dept = all.find((item: any) => item.department_id.toString() === id);
      setData(dept || null); // 沒找到則設為 null
      setLoading(false); // 載入完成
    }

    if (id) fetchData();
  }, [id]);

  // 資料載入中顯示 loading 畫面
  if (loading) return <div className="text-center py-16 text-gray-500 dark:text-gray-300">🔄 載入中...</div>;

  // 若找不到該 id 對應的資料
  if (!data) return <div className="text-center py-16 text-red-500 dark:text-red-300">🚫 找不到該系所資料</div>;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* 返回上一頁按鈕 */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-block bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-4 py-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition"
        >
          ← 返回上一頁
        </button>

        {/* 頁面標題與簡介 */}
        <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2">
          {data.department_name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">轉系資訊詳細說明</p>

        {/* 區塊一：年級與名額 */}
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

        {/* 區塊四：備註（若有資料才顯示） */}
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
