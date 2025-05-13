import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 取得完整資料
export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const id = Number(context.params.id);

  // 1. 取得 departments 資料
  const { data: department, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .eq('department_id', id)
    .single();

  if (deptError || !department) {
    return NextResponse.json({ error: '找不到系所資料' }, { status: 404 });
  }

  // 2. 取得條件資料
  const { data: condition, error: condError } = await supabase
    .from('transfer_conditions')
    .select('*')
    .eq('department_id', id)
    .single();

  // 3. 取得名額資料
  const { data: quotas, error: quotaError } = await supabase
    .from('grade_quotas')
    .select('*')
    .eq('department_id', id);

  return NextResponse.json({
    ...department,
    exam_subjects: condition?.exam_subjects || '',
    score_ratio: condition?.score_ratio || {},
    remarks: condition?.remarks || '',
    quotas: quotas || [],
  });
}

// 更新資料
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const id = Number(context.params.id);
  const body = await req.json();

  // 1. 更新 department 基本資料
  const { department_name, category, exam_subjects, score_ratio, remarks, quotas } = body;

  const { error: deptError } = await supabase
    .from('departments')
    .update({ department_name, category })
    .eq('department_id', id);

  if (deptError) {
    return NextResponse.json({ error: deptError.message }, { status: 500 });
  }

  // 2. 更新條件資料（upsert）
  const { error: condError } = await supabase
    .from('transfer_conditions')
    .upsert({
      department_id: id,
      exam_subjects,
      score_ratio,
      remarks,
    });

  if (condError) {
    return NextResponse.json({ error: condError.message }, { status: 500 });
  }

  // 3. 更新名額（刪除舊的再插入）
  const { error: delError } = await supabase
    .from('grade_quotas')
    .delete()
    .eq('department_id', id);

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }

  const formattedQuotas = (quotas || []).map((q: any) => ({
    department_id: id,
    grade: q.grade,
    quota: q.quota,
  }));

  const { error: insertError } = await supabase
    .from('grade_quotas')
    .insert(formattedQuotas);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: '更新成功' });
}

// 刪除資料
export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const id = Number(context.params.id);

  // 先刪 transfer_conditions & quotas，再刪 department
  const { error: condError } = await supabase
    .from('transfer_conditions')
    .delete()
    .eq('department_id', id);

  const { error: quotaError } = await supabase
    .from('grade_quotas')
    .delete()
    .eq('department_id', id);

  const { error: deptError } = await supabase
    .from('departments')
    .delete()
    .eq('department_id', id);

  const firstError = condError || quotaError || deptError;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({ message: '刪除成功' });
}
