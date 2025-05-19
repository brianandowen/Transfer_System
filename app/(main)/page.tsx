'use client'; // 宣告這是 Client Component（必要，才能使用 hook）

import Link from 'next/link'; // 用來建立前往其他頁面的超連結
import { useEffect, useState } from 'react'; // React 的 Hook：useState 狀態管理、useEffect 副作用（如 API 請求）

export default function HomePage() {
  // 儲存從後端取得的所有系所資料
  const [data, setData] = useState<any[]>([]);

  // 使用者輸入的搜尋關鍵字
  const [searchTerm, setSearchTerm] = useState('');

  // 使用者目前選取的分類（學群）
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 網頁初次載入時，從 API 抓取所有系所資料
  useEffect(() => {
    fetch('/api/conditions')
      .then((res) => res.json())
      .then((data) => setData(data)) // 成功取得資料後更新狀態
      .catch((err) => console.error('❌ API錯誤:', err)); // 錯誤處理
  }, []);

  // 從系所資料中萃取所有不重複的學群，供分類按鈕使用
  const categories = Array.from(new Set(data.map((item) => item.category)));

  // 根據搜尋字串與學群分類，篩選出符合的系所
  const filteredData = data.filter((item) => {
    const matchSearch = item.department_name.includes(searchTerm); // 名稱是否包含搜尋關鍵字
    const matchCategory = selectedCategory ? item.category === selectedCategory : true; // 是否符合選取分類
    return matchSearch && matchCategory;
  });

  // 點擊「清除分類」按鈕時執行的動作
  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題區 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">📚 系所總覽</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">輸入關鍵字或選擇分類，快速找出你有興趣的系所</p>
        </div>

        {/* 搜尋欄位區 */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl">
            <input
              type="text"
              placeholder="輸入系所名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // 輸入變動時更新 searchTerm
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-800 px-4 py-3 rounded-lg shadow border w-full"
            />
            <button
              onClick={() => setSearchTerm('')} // 清除輸入框內容
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg transition"
            >
              清除搜尋
            </button>
          </div>
        </div>

        {/* 分類按鈕列 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)} // 點擊設定選取分類
              className={`px-5 py-3 text-base rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
          {/* 顯示「清除分類」按鈕（若有選取分類） */}
          {selectedCategory && (
            <button
              onClick={handleClearCategory}
              className="px-5 py-3 text-base rounded-full font-medium bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-600"
            >
              清除分類
            </button>
          )}
        </div>

        {/* 系所卡片清單區 */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Link key={item.department_id} href={`/${item.department_id}`}>
                <div className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow hover:shadow-lg hover:border-blue-400 transition cursor-pointer">
                  {/* 系所名稱 */}
                  <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">{item.department_name}</h2>

                  {/* 轉入年級與名額 */}
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

                  {/* 考試科目 */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">考試科目：</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{item.exam_subjects}</p>
                  </div>

                  {/* 成績比例（JSON 格式解析） */}
                  <div className="mt-auto">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">成績比例：</h4>
                    {(() => {
                      let ratio = item.score_ratio;

                      try {
                        if (typeof ratio === 'string') {
                          ratio = JSON.parse(ratio); // 嘗試將字串轉換為物件
                        }
                      } catch (e) {
                        console.error('❌ 無法解析 score_ratio:', e, ratio);
                        ratio = {};
                      }

                      // 若 ratio 是有效物件，顯示各項目比例；否則顯示無資料
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
            // 無符合資料時顯示的提示
            <div className="col-span-3 text-center text-gray-400 dark:text-gray-500 text-xl p-10">
              🚫 沒有找到符合的系所
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
