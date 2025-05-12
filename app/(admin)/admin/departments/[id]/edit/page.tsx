'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditDepartmentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [departmentName, setDepartmentName] = useState('');
  const [category, setCategory] = useState('');
  const [examSubjects, setExamSubjects] = useState('');
  const [scoreRatios, setScoreRatios] = useState<{ label: string; value: number }[]>([]);
  const [remarks, setRemarks] = useState('');
  const [quotas, setQuotas] = useState([{ grade: '', quota: '' }]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/departments/${id}/full`);
      if (!res.ok) return;

      const data = await res.json();

      setDepartmentName(data.department_name || '');
      setCategory(data.category || '');
      setExamSubjects(data.exam_subjects || '');
      setRemarks(data.remarks || '');

      const ratioArray = Object.entries(data.score_ratio || {}).map(([label, value]) => ({
        label,
        value: Number(value),
      }));
      setScoreRatios(ratioArray.length ? ratioArray : [{ label: '', value: 0 }]);
      setQuotas(data.quotas?.length ? data.quotas : [{ grade: '', quota: '' }]);
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = scoreRatios.reduce((sum, item) => sum + Number(item.value), 0);
    if (total !== 100) {
      alert('❌ 百分比加總必須為 100');
      return;
    }

    const scoreRatioObject = scoreRatios.reduce((obj, item) => {
      if (item.label.trim() !== '') {
        obj[item.label] = Number(item.value);
      }
      return obj;
    }, {} as Record<string, number>);

    const res = await fetch(`/api/departments/${id}/full`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department_name: departmentName,
        category,
        exam_subjects: examSubjects,
        score_ratio: scoreRatioObject,
        remarks,
        quotas,
      }),
    });

    if (res.ok) {
      alert('✅ 更新成功');
      router.push('/admin');
    } else {
      let message = '❌ 更新失敗';
      try {
        const err = await res.json();
        message += '：' + err.message;
      } catch {
        message += '（後端沒有提供錯誤訊息）';
      }
      alert(message);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(`你確定要刪除「${departmentName}」嗎？這會刪除所有條件與名額資料。`);
    if (!confirmed) return;

    const res = await fetch(`/api/departments/${id}/full`, {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('✅ 系所已刪除');
      router.push('/admin');
    } else {
      try {
        const err = await res.json();
        alert(`❌ 刪除失敗：${err.message}`);
      } catch {
        alert('❌ 刪除失敗（後端沒有回應錯誤訊息）');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-300">編輯系所細節</h1>

      {/* 基本資料 */}
      <fieldset className="space-y-2 border border-gray-600 p-4 rounded">
        <legend className="font-semibold text-white">基本資料</legend>
        <input value={departmentName} onChange={e => setDepartmentName(e.target.value)} placeholder="系所名稱" className="w-full p-2 bg-gray-800 border border-gray-600 rounded" required />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="學群類別" className="w-full p-2 bg-gray-800 border border-gray-600 rounded" required />
      </fieldset>

      {/* 轉系條件 */}
      <fieldset className="space-y-2 border border-gray-600 p-4 rounded">
        <legend className="font-semibold text-white">轉系條件</legend>
        <input value={examSubjects} onChange={e => setExamSubjects(e.target.value)} placeholder="審查科目說明" className="w-full p-2 bg-gray-800 border border-gray-600 rounded" required />
        {scoreRatios.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input value={item.label} onChange={e => {
              const list = [...scoreRatios];
              list[idx].label = e.target.value;
              setScoreRatios(list);
            }} placeholder="項目" className="w-1/2 p-2 bg-gray-800 border border-gray-600 rounded" />
            <input type="number" value={item.value} onChange={e => {
              const list = [...scoreRatios];
              list[idx].value = Number(e.target.value);
              setScoreRatios(list);
            }} placeholder="%" className="w-1/2 p-2 bg-gray-800 border border-gray-600 rounded" />
          </div>
        ))}
        <button type="button" onClick={() => setScoreRatios([...scoreRatios, { label: '', value: 0 }])} className="text-sm text-blue-400 hover:underline">+ 新增項目</button>
        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="備註" className="w-full p-2 bg-gray-800 border border-gray-600 rounded" />
      </fieldset>

      {/* 年級名額 */}
      <fieldset className="space-y-2 border border-gray-600 p-4 rounded">
        <legend className="font-semibold text-white">名額（各年級）</legend>
        {quotas.map((q, idx) => (
          <div key={idx} className="flex gap-2">
            <input value={q.grade} onChange={e => {
              const list = [...quotas];
              list[idx].grade = e.target.value;
              setQuotas(list);
            }} placeholder="年級" className="w-1/2 p-2 bg-gray-800 border border-gray-600 rounded" />
            <input value={q.quota} onChange={e => {
              const list = [...quotas];
              list[idx].quota = e.target.value;
              setQuotas(list);
            }} placeholder="名額" className="w-1/2 p-2 bg-gray-800 border border-gray-600 rounded" />
          </div>
        ))}
        <button type="button" onClick={() => setQuotas([...quotas, { grade: '', quota: '' }])} className="text-sm text-blue-400 hover:underline">+ 新增年級</button>
      </fieldset>

      <div className="flex gap-4">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
          儲存所有資料
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
        >
          🗑️ 刪除此系所
        </button>
      </div>
    </form>
  );
}
