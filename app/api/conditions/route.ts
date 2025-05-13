import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('department_id');

    if (deptError) {
      return NextResponse.json({ message: deptError.message }, { status: 500 });
    }

    const { data: conditions, error: condError } = await supabase
      .from('transfer_conditions')
      .select('*');

    if (condError) {
      return NextResponse.json({ message: condError.message }, { status: 500 });
    }

    const { data: quotas, error: quotaError } = await supabase
      .from('grade_quotas')
      .select('*');

    if (quotaError) {
      return NextResponse.json({ message: quotaError.message }, { status: 500 });
    }

    const result = departments.map((dept) => {
      const condition = conditions.find(c => c.department_id === dept.department_id);
      const deptQuotas = quotas
        .filter(q => q.department_id === dept.department_id)
        .map(q => ({
          grade: q.grade,
          quota: q.quota
        }));

      const ratioObject =
        typeof condition?.score_ratio === 'object' && condition?.score_ratio !== null
          ? condition.score_ratio
          : {};

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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Supabase 查詢錯誤:', error);
    return NextResponse.json({ message: error.message || '查詢失敗' }, { status: 500 });
  }
}
