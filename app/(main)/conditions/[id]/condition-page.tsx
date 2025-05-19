// 引入 Next.js 提供的 notFound 方法，用於導向 404 頁面
import { notFound } from 'next/navigation';

// 專門用來取得指定 id 的系所完整資料
async function getDepartmentData(id: number) {
  // 發送 API 請求到 /api/conditions（從環境變數取得 BASE_URL，預設為 localhost）
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/conditions`, {
    cache: 'no-store', // 關閉快取，確保每次請求都獲得最新資料
  });
  const data = await res.json();

  // 從結果中找到符合 department_id 的那筆資料
  return data.find((item: any) => item.department_id === id);
}

// 頁面元件，用來顯示單一系所的轉系條件詳情
// 使用 async function + default export，讓 Next.js 自動作為路由元件使用
export default async function TransferConditionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // Next.js 14 開始支援 params 是 Promise 形式（Server Component）
}) {
  const { id } = await params; // 解構取得 id
  const numericId = parseInt(id, 10); // 將字串轉換為數字
  const department = await getDepartmentData(numericId); // 取得系所資料

  // 若找不到該系所，導向 404
  if (!department) {
    notFound();
  }

  // 渲染該系所的詳細轉系資訊
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">{department.department_name}</h1>

      {/* 顯示轉入年級與名額 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">轉入年級與名額</h2>
        <ul className="list-disc list-inside">
          {department.quotas.map((q: any, index: number) => (
            <li key={index}>
              {q.grade} 年級 — {q.quota} 名
            </li>
          ))}
        </ul>
      </div>

      {/* 顯示考試科目 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">考試科目</h2>
        <p>{department.exam_subjects}</p>
      </div>

      {/* 顯示成績比例（從物件轉為列表） */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">成績比例</h2>
        <ul>
          {Object.entries(department.score_ratio).map(([subject, percent]: any, index) => (
            <li key={index}>
              {subject}：{percent}%
            </li>
          ))}
        </ul>
      </div>

      {/* 顯示備註（支援換行） */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">備註</h2>
        <p className="whitespace-pre-line">{department.remarks}</p>
      </div>
    </main>
  );
}
