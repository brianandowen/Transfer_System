'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 抓系所資料
  useEffect(() => {
    fetch('/api/conditions')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('❌ API錯誤:', err));
  }, []);

  const categories = Array.from(new Set(data.map((item) => item.category)));

  const filteredData = data.filter((item) => {
    const matchSearch = item.department_name.includes(searchTerm);
    const matchCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchSearch && matchCategory;
  });

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">📚 系所總覽</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">輸入關鍵字或選擇分類，快速找出你有興趣的系所</p>
        </div>

        {/* 搜尋列 */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl">
            <input
              type="text"
              placeholder="輸入系所名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-800 px-4 py-3 rounded-lg shadow border w-full"
            />
            <button
              onClick={() => setSearchTerm('')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg transition"
            >
              清除搜尋
            </button>
          </div>
        </div>

        {/* 分類按鈕 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-3 text-base rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
          {selectedCategory && (
            <button
              onClick={handleClearCategory}
              className="px-5 py-3 text-base rounded-full font-medium bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-600"
            >
              清除分類
            </button>
          )}
        </div>

        {/* 系所卡片 Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Link key={item.department_id} href={`/${item.department_id}`}>
                <div className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow hover:shadow-lg hover:border-blue-400 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">{item.department_name}</h2>

                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">轉入年級與名額：</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200">
                      {item.quotas.map((q: any, index: number) => (
                        <li key={index}>
                          {q.grade} 年級 — {q.quota} 名
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">考試科目：</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{item.exam_subjects}</p>
                  </div>
<div className="mt-auto">
  <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">成績比例：</h4>
  {(() => {
    let ratio = item.score_ratio;

    try {
      if (typeof ratio === 'string') {
        ratio = JSON.parse(ratio);
      }
    } catch (e) {
      console.error('❌ 無法解析 score_ratio:', e, ratio);
      ratio = {};
    }

    return ratio && typeof ratio === 'object' && Object.keys(ratio).length > 0 ? (
      <ul className="text-sm text-gray-700 dark:text-gray-200">
        {Object.entries(ratio as Record<string, any>).map(([subject, percent], index) => (
          <li key={index}>{subject}：{percent}%</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">無成績比例資料</p>
    );
  })()}
</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400 dark:text-gray-500 text-xl p-10">
              🚫 沒有找到符合的系所
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
