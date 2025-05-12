'use client';

import { useEffect, useState } from 'react';

type Schedule = {
  academic_year: string;
  apply_period: string;
  document_deadline: string;
  announcement_date: string;
  announcement_link: string;
};

export default function Home() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      const res = await fetch('/api/transfer-schedule');
      const data = await res.json();
      setSchedule(data);
    }

    fetchSchedule();
  }, []);

  if (!schedule) {
    return <div className="text-white p-10">載入中...</div>;
  }

  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 underline mb-10">
          {schedule.academic_year} 學年度轉系時程
        </h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-2xl text-blue-600 dark:text-blue-300 font-semibold mb-4">📌 重要時程</h2>

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

          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              ※ 以上時程僅供參考，實際時程以教務處公告為準。<br />
              ※ 請務必在截止時間前完成所有申請程序。
            </p>

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
