import { NextRequest, NextResponse } from 'next/server'; // ✅ Next.js API Route 標準函式與回應工具
import { supabase } from '@/lib/supabase'; // ✅ 匯入已設定好的 Supabase 客戶端連線物件

// ✅ 這支 API 用於取得所有系所的整合資料（含條件、名額）
export async function GET(req: NextRequest) {
  try {
    // ✅ 查詢 departments 資料表，取出所有系所，依照 department_id 排序
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('department_id');

    if (deptError) {
      // ❌ 查詢失敗時回傳錯誤訊息
      return NextResponse.json({ message: deptError.message }, { status: 500 });
    }

    // ✅ 查詢 transfer_conditions 資料表，包含考試科目、成績比例與備註
    const { data: conditions, error: condError } = await supabase
      .from('transfer_conditions')
      .select('*');

    if (condError) {
      return NextResponse.json({ message: condError.message }, { status: 500 });
    }

    // ✅ 查詢 grade_quotas 資料表，包含每個年級的名額
    const { data: quotas, error: quotaError } = await supabase
      .from('grade_quotas')
      .select('*');

    if (quotaError) {
      return NextResponse.json({ message: quotaError.message }, { status: 500 });
    }

    // ✅ 整合三張表格的資料為一個物件陣列（result）
    const result = departments.map((dept) => {
      // 找出該系所對應的條件（transfer_conditions）
      const condition = conditions.find(c => c.department_id === dept.department_id);

      // 找出該系所的各年級名額（grade_quotas），整理格式
      const deptQuotas = quotas
        .filter(q => q.department_id === dept.department_id)
        .map(q => ({
          grade: q.grade,
          quota: q.quota
        }));

      // ✅ 若成績比例欄位為物件格式才使用，否則使用空物件（避免 JSON 解析錯誤）
      const ratioObject =
        typeof condition?.score_ratio === 'object' && condition?.score_ratio !== null
          ? condition.score_ratio
          : {};

      // ✅ 回傳一個包含整合資料的系所物件
      return {
        department_id: dept.department_id,
        department_name: dept.department_name,
        category: dept.category,
        exam_subjects: condition?.exam_subjects || '',
        score_ratio: ratioObject,
        remarks: condition?.remarks || '',
        quotas: deptQuotas
      };
    });

    // ✅ 最後統一回傳整個整合資料陣列
    return NextResponse.json(result);
  } catch (error: any) {
    // ❌ 發生非預期錯誤（如網路或 Supabase 客戶端異常）
    console.error('❌ Supabase 查詢錯誤:', error);
    return NextResponse.json({ message: error.message || '查詢失敗' }, { status: 500 });
  }
}
