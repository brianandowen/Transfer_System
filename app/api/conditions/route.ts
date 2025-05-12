import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // 抓出所有 departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('department_id');

    if (deptError) {
      return NextResponse.json({ error: deptError.message }, { status: 500 });
    }

    // 抓出所有 transfer_conditions
    const { data: conditions, error: condError } = await supabase
      .from('transfer_conditions')
      .select('*');

    if (condError) {
      return NextResponse.json({ error: condError.message }, { status: 500 });
    }

    // 抓出所有 grade_quotas
    const { data: quotas, error: quotaError } = await supabase
      .from('grade_quotas')
      .select('*');

    if (quotaError) {
      return NextResponse.json({ error: quotaError.message }, { status: 500 });
    }

    // 組合資料
    const result = departments.map((dept) => {
      const condition = conditions.find(c => c.department_id === dept.department_id);
      const deptQuotas = quotas
        .filter(q => q.department_id === dept.department_id)
        .map(q => ({
          grade: q.grade,
          quota: q.quota
        }));

      let parsedRatio = {};
      try {
        parsedRatio = condition?.score_ratio ? JSON.parse(condition.score_ratio) : {};
      } catch {
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
    console.error('❌ Supabase 查詢錯誤:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
