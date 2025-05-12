'use client';

import React from 'react';

export default function DepartmentGuide() {
  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 mb-10">選擇適合你的科系</h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-10">
          <h2 className="text-2xl text-blue-600 dark:text-blue-300 font-semibold mb-4">如何選擇適合的科系？</h2>
          <p>選擇科系是一個重要的決定，需要考慮多個面向：</p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>了解自己的興趣和專長</li>
            <li>考慮未來的職業發展方向</li>
            <li>評估自己的學習能力和特質</li>
            <li>參考學長姐的經驗分享</li>
            <li>查詢該系的課程規劃和特色</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-10">
          <h2 className="text-2xl text-blue-600 dark:text-blue-300 font-semibold mb-4">輔大各學院特色</h2>
          <p>輔仁大學擁有12個學院，每個學院都有其獨特的優勢和特色：</p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>文學院：培養人文素養，開拓國際視野</li>
            <li>藝術學院：結合理論與實務，發展創意潛能</li>
            <li>傳播學院：培育新媒體人才，接軌產業需求</li>
            <li>教育學院：著重教育理論與實踐的結合</li>
            <li>醫學院：培養專業醫療人才，服務社會</li>
            <li>理工學院：強調創新研發，培育科技人才</li>
            <li>外語學院：培養多元語言能力，拓展國際視野</li>
            <li>民生學院：關注民生議題，培育生活產業人才</li>
            <li>法律學院：培養法律專業人才，維護社會正義</li>
            <li>管理學院：培育企業管理人才，接軌國際趨勢</li>
            <li>社會科學院：關注社會議題，培養社會科學人才</li>
            <li>織品服裝學院：結合創意與實務，培育時尚產業人才</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl text-blue-600 dark:text-blue-300 font-semibold mb-4">更多資源</h2>
          <p>以下是一些可以幫助你做決定的資源：</p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>學系官網：了解課程規劃和未來發展</li>
            <li>系學會：參與系上活動，認識學長姐</li>
            <li>職涯發展中心：提供職涯諮詢服務</li>
            <li>導師諮詢：尋求專業建議和指導</li>
          </ul>
          <a
            href="https://www.fju.edu.tw/resource.jsp?labelID=33"
            className="block mt-6 text-blue-600 dark:text-blue-300 hover:underline font-medium"
            target="_blank"
          >
            🔗 查看更多輔大學系資訊 →
          </a>
        </div>
      </div>
    </main>
  );
}
