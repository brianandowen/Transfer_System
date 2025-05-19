'use client'; // 宣告這是 Client Component，可使用 useState 等 hook

import { useState } from 'react';

export default function AIPromptTool() {
  // copied: 控制按鈕提示是否顯示「已複製」
  const [copied, setCopied] = useState(false);

  // ChatGPT 專用的 Prompt 文字，含學系推薦說明與格式
  const promptText = `你是一個學系選擇顧問，根據我們過往的對話細節以及你對我的了解，幫我選擇最適合的學系，並排除最不適合的學系，如你認為資料不足以進行分析可以就住以下特質逐步提問。請基於輔仁大學的所有學系進行分析，並參考以下相關學群進行分類：資訊學群、工程學群、數理化學群、醫藥衛生學群、生命科學學群、建築設計學群、藝術學群、社會心理學群、大眾傳播學群、外語學群、文史哲學群、教育學群、法政學群、管理學群、財經學群、遊憩運動學群。請結合我們之前的對話內容和我提供的特質，進行深入分析並給出建議。 我的特質如下（若對話中已有相關資訊，請優先使用）： 學科能力（擅長的科目，例如數學、生物、語言） 性格特質（例如細心、創意、抗壓能力強） 興趣偏好（例如對技術、醫療、設計感興趣） 弱點（不擅長的領域或科目，例如數學、語言、藝術） 抗壓能力（例如高、中、低） 請按照以下步驟分析： 根據我過往提到的學科能力或對話中透露的傾向，找出適合的學系（例如提到擅長數學，適合資訊工程學系）。 根據我曾描述的性格特質或對話中顯現的特點，進一步篩選適合的學系（例如提到細心，適合兒童與家庭學系）。 根據我過往表達的興趣偏好，確認最適合的學系（例如提到對技術感興趣，適合資訊工程學系）。 根據我提及的弱點或抗壓能力相關線索，排除不適合的學系或確認適合的學系（例如提到抗壓能力低，不適合醫學系）。 提供最終建議： 推薦最適合的學系（至少 1-3 個），並說明原因，優先引用對話中的具體細節。 指出最不適合的學系（至少 1-3 個），並說明原因，結合過往資訊。 輸出格式如下： 最適合的學系： 學系名稱（學群）：原因（請盡可能引用對話中的具體內容） 學系名稱（學群）：原因（請盡可能引用對話中的具體內容） 學系名稱（學群）：原因（請盡可能引用對話中的具體內容） 最不適合的學系： 學系名稱（學群）：原因（請盡可能引用對話中的具體內容） 學系名稱（學群）：原因（請盡可能引用對話中的具體內容） 學系名稱（學群）：原因（請盡可能引用對話中的具體內容） 如果對話中資訊不足以完整分析，請提示我補充更多細節，例如學科能力、興趣或性格特質，以便更精確地推薦最適合我的學系。`;

  // 點擊按鈕後執行的複製邏輯
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText); // 將 prompt 複製到剪貼簿
      setCopied(true); // 顯示提示
      setTimeout(() => setCopied(false), 2000); // 2 秒後自動關閉提示
    } catch (err) {
      console.error('❌ 複製失敗:', err); // 錯誤處理
    }
  };

  return (
    <main className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 mb-10">🧠 AI 學系選擇工具</h1>

        {/* 內容卡片 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
          <p className="text-lg">這個工具可以幫助你找到最適合的學系！（適合 ChatGPT 使用者）</p>

          {/* 說明步驟 */}
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>點擊下方「複製 Prompt」按鈕，將文字複製到剪貼簿</li>
            <li>前往 ChatGPT 或你喜歡的 AI 工具</li>
            <li>將 Prompt 貼上</li>
            <li>依照指引輸入你的特質，AI 就會為你推薦科系</li>
          </ul>

          {/* 複製按鈕，根據狀態改變樣式與文字 */}
          <button
            onClick={copyPrompt}
            className={`w-full text-center font-medium px-4 py-3 rounded-lg transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {copied ? '✅ 已複製 Prompt！' : '📋 複製 Prompt'}
          </button>

          {/* 提示文字 */}
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            提示：你也可以根據需要自行調整 prompt 的描述內容
          </p>
        </div>
      </div>
    </main>
  );
}
