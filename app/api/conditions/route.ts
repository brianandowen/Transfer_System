import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // 取得 departments 資料
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('department_id');

    if (deptError) {
      console.error('❌ 讀取 departments 時發生錯誤:', deptError.message);
      return NextResponse.json({ error: deptError.message }, { status: 500 });
    }

    // 取得 transfer_conditions
    const { data: conditions, error: condError } = await supabase
      .from('transfer_conditions')
      .select('*');

    if (condError) {
      console.error('❌ 讀取 transfer_conditions 時發生錯誤:', condError.message);
      return NextResponse.json({ error: condError.message }, { status: 500 });
    }

    // 取得 grade_quotas
    const { data: quotas, error: quotaError } = await supabase
      .from('grade_quotas')
      .select('*');

    if (quotaError) {
      console.error('❌ 讀取 grade_quotas 時發生錯誤:', quotaError.message);
      return NextResponse.json({ error: quotaError.message }, { status: 500 });
    }

    const result = departments.map((dept) => {
      const condition = conditions.find(c => c.department_id === dept.department_id);
      const deptQuotas = quotas
        .filter(q => q.department_id === dept.department_id)
        .map(q => ({
          grade: q.grade,
          quota: q.quota
        }));

      // 安全處理 jsonb 欄位，並加入錯誤偵測
      let parsedRatio = {};
      try {
        const raw = condition?.score_ratio;
        if (raw && typeof raw !== 'object') {
          console.warn(`⚠️ department ${dept.department_id} 的 score_ratio 欄位不是 object，而是:`, raw);
        }
        parsedRatio = raw && typeof raw === 'object' ? raw : {};
      } catch (err) {
        console.error(`❌ score_ratio 錯誤（department_id: ${dept.department_id}）:`, err);
        parsedRatio = {};
      }

      return {
        department_id: dept.department_id,
        department_name: dept.department_name,
        category: dept.category,
        exam_subjects: condition?.exam_subjects || '',
        score_ratio: parsedRatio,
        remarks: condition?.remarks || '',
        quotas: deptQuotas
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Supabase 查詢錯誤（系統級錯誤）:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
