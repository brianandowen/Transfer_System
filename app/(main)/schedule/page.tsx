'use client'; // 這行是 Next.js 的指令，用來宣告這是 Client Component，才能使用 React 的 Hook

import { useEffect, useState } from 'react'; // 引入 React 的 Hook：useState（狀態管理）、useEffect（副作用處理）

// 定義 Schedule 型別，對應轉系時程資料的欄位
type Schedule = {
  academic_year: string;        // 學年度（例如：113 學年度）
  apply_period: string;         // 線上申請期間
  document_deadline: string;    // 繳交資料截止日
  announcement_date: string;    // 公告日期
  announcement_link: string;    // 公告連結（可點擊）
};

export default function Home() {
  // 定義一個狀態變數 schedule，用來儲存轉系時程資料，初始為 null
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  // 在元件第一次載入後執行 fetchSchedule，從 API 抓取資料
  useEffect(() => {
    async function fetchSchedule() {
      const res = await fetch('/api/transfer-schedule'); // 向後端發送請求
      const data = await res.json(); // 解析 JSON 資料
      setSchedule(data); // 存入狀態中
    }

    fetchSchedule(); // 呼叫函式
  }, []); // 空依賴陣列表示只執行一次（元件掛載時）

  // 如果資料尚未載入，顯示載入中畫面
  if (!schedule) {
    return <div className="text-white p-10">載入中...</div>;
  }

  // 資料已成功載入，開始渲染畫面
  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* 標題區塊：顯示學年度 */}
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 underline mb-10">
          {schedule.academic_year} 學年度轉系時程
        </h1>

        {/* 主要卡片區塊 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-2xl text-blue-600 dark:text-blue-300 font-semibold mb-4">📌 重要時程</h2>

          {/* 各項時程說明 */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow border-l-4 border-blue-400">
              <span className="font-medium">📅 線上申請期間：</span>{schedule.apply_period}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow border-l-4 border-blue-400">
              <span className="font-medium">📝 繳交申請資料：</span>{schedule.document_deadline}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow border-l-4 border-blue-400">
              <span className="font-medium">📢 核定名單公告：</span>{schedule.announcement_date}
            </div>
          </div>

          {/* 備註與公告連結 */}
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              ※ 以上時程僅供參考，實際時程以教務處公告為準。<br />
              ※ 請務必在截止時間前完成所有申請程序。
            </p>

            {/* 如果有提供公告連結，則顯示按鈕 */}
            {schedule.announcement_link && (
              <a
                href={schedule.announcement_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-md transition"
              >
                🔗 查看原始公告
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
