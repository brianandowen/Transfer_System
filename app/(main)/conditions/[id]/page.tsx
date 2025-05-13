import { notFound } from 'next/navigation';

async function getDepartmentData(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/conditions`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return data.find((item: any) => item.department_id === id);
}

// ✅ 避免使用函式名 Page，改為 TransferConditionDetailPage
export default async function TransferConditionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  const department = await getDepartmentData(id);

  if (!department) {
    notFound();
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">{department.department_name}</h1>

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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">考試科目</h2>
        <p>{department.exam_subjects}</p>
      </div>

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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">備註</h2>
        <p className="whitespace-pre-line">{department.remarks}</p>
      </div>
    </main>
  );
}
