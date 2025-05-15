import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET：取得完整資料
export async function GET(_: NextRequest, context: any) {
  const rawId = context.params?.id;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: '系所 ID 無效' }, { status: 400 });
  }

  const { data: department, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .eq('department_id', id)
    .single();

  if (deptError || !department) {
    return NextResponse.json({ message: '找不到系所資料' }, { status: 404 });
  }

  const { data: condition } = await supabase
    .from('transfer_conditions')
    .select('*')
    .eq('department_id', id)
    .single();

  const { data: quotas } = await supabase
    .from('grade_quotas')
    .select('grade, quota')
    .eq('department_id', id);

  return NextResponse.json({
    ...department,
    exam_subjects: condition?.exam_subjects || '',
    score_ratio: condition?.score_ratio || {},
    remarks: condition?.remarks || '',
    quotas: quotas || [],
  });
}

// PATCH：更新所有資料
export async function PATCH(req: NextRequest, context: any) {
  const rawId = context.params?.id;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: '系所 ID 無效' }, { status: 400 });
  }

  const body = await req.json();
  console.log('🔄 PATCH 收到資料:', body);

  const {
    department_name,
    category,
    exam_subjects,
    score_ratio,
    remarks,
    quotas,
  } = body;

  // ✅ 更新 departments
  const { error: deptError } = await supabase
    .from('departments')
    .update({ department_name, category })
    .eq('department_id', id);

  if (deptError) {
    return NextResponse.json({ message: deptError.message }, { status: 500 });
  }

  // ✅ 更新 transfer_conditions，避免覆蓋主鍵 condition_id
  const { error: condError } = await supabase
    .from('transfer_conditions')
    .upsert(
      {
        department_id: id,
        exam_subjects,
        score_ratio,
        remarks,
      },
      {
        onConflict: 'department_id', // ✅ 防止覆蓋 condition_id
      }
    );

  if (condError) {
    return NextResponse.json({ message: condError.message }, { status: 500 });
  }

  // ✅ 刪除原 quota 再插入新 quota
  const { error: delError } = await supabase
    .from('grade_quotas')
    .delete()
    .eq('department_id', id);

  if (delError) {
    return NextResponse.json({ message: delError.message }, { status: 500 });
  }

  const formattedQuotas = (quotas || [])
    .filter((q: any) => q.grade && q.quota)
    .map((q: any) => ({
      department_id: id,
      grade: q.grade,
      quota: q.quota,
    }));

  const { error: insertError } = await supabase
    .from('grade_quotas')
    .insert(formattedQuotas);

  if (insertError) {
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: '更新成功' });
}

// DELETE：刪除整筆資料
export async function DELETE(_: NextRequest, context: any) {
  const rawId = context.params?.id;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: '系所 ID 無效' }, { status: 400 });
  }

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
    return NextResponse.json({ message: firstError.message }, { status: 500 });
  }

  return NextResponse.json({ message: '刪除成功' });
}
