'use client'; // ✅ 宣告為 Client Component，可使用 useState、useEffect、useRouter 等 hook

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // ✅ 取得網址參數（useParams）與頁面跳轉功能（useRouter）

export default function EditDepartmentPage() {
  const { id } = useParams();     // ✅ 從 URL 中取得系所 id
  const router = useRouter();     // ✅ 初始化路由，用於跳轉頁面

  // ✅ 狀態區：儲存系所基本資料與相關欄位
  const [departmentName, setDepartmentName] = useState('');
  const [category, setCategory] = useState('');
  const [examSubjects, setExamSubjects] = useState('');
  const [scoreRatios, setScoreRatios] = useState<{ label: string; value: number }[]>([]);
  const [remarks, setRemarks] = useState('');
  const [quotas, setQuotas] = useState([{ grade: '', quota: '' }]); // 各年級名額

  // ✅ 初始載入系所完整資料
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/departments/${id}/full`);
      if (!res.ok) return;

      const data = await res.json();

      setDepartmentName(data.department_name || '');
      setCategory(data.category || '');
      setExamSubjects(data.exam_subjects || '');
      setRemarks(data.remarks || '');

      // ✅ 將物件轉為陣列格式顯示（分數比例）
      const ratioArray = Object.entries(data.score_ratio || {}).map(([label, value]) => ({
        label,
        value: Number(value),
      }));
      setScoreRatios(ratioArray.length ? ratioArray : [{ label: '', value: 0 }]);

      // ✅ 若 quotas 為空，設一組預設欄位
      setQuotas(data.quotas?.length ? data.quotas : [{ grade: '', quota: '' }]);
    }

    fetchData();
  }, [id]);

  // ✅ 表單送出：進行 PATCH 更新系所資料
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 檢查百分比加總需為 100
    const total = scoreRatios.reduce((sum, item) => sum + Number(item.value), 0);
    if (total !== 100) {
      alert('❌ 百分比加總必須為 100');
      return;
    }

    // ✅ 整理 score_ratio 轉為物件格式
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

  // ✅ 刪除系所：確認後發送 DELETE 請求
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

      {/* ✅ 區塊一：基本資料（系所名稱 + 所屬學群） */}
      <fieldset className="space-y-2 border border-gray-600 p-4 rounded">
        <legend className="font-semibold text-white">基本資料</legend>
        <input value={departmentName} onChange={e => setDepartmentName(e.target.value)} placeholder="系所名稱" className="w-full p-2 bg-gray-800 border border-gray-600 rounded" required />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          required
        >
          <option value="">請選擇學群類別</option>
          <option value="文學與人文學群">文學與人文學群</option>
          <option value="跨領域學群">跨領域學群</option>
          <option value="藝術學群">藝術學群</option>
          <option value="教育學群">教育學群</option>
          <option value="醫藥衛生學群">醫藥衛生學群</option>
          <option value="社會與心理學群">社會與心理學群</option>
          <option value="外語學群">外語學群</option>
          <option value="商業與管理學群">商業與管理學群</option>
          <option value="生活科學學群">生活科學學群</option>
          <option value="法律與政治學群">法律與政治學群</option>
          <option value="資訊與工程學群">資訊與工程學群</option>
          <option value="數理化學群">數理化學群</option>
        </select>
      </fieldset>

      {/* ✅ 區塊二：審查條件（科目、成績比例、備註） */}
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

      {/* ✅ 區塊三：各年級名額設定 */}
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

      {/* ✅ 儲存與刪除按鈕 */}
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
