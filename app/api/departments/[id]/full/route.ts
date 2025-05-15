import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET：取得完整資料
export async function GET(_: NextRequest, context: any) {
  const rawId = context.params?.id;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    console.error('❌ GET：無效 ID', rawId);
    return NextResponse.json({ message: '系所 ID 無效' }, { status: 400 });
  }

  const { data: department, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .eq('department_id', id)
    .single();

  if (deptError || !department) {
    console.error('❌ GET：找不到系所', deptError?.message);
    return NextResponse.json({ message: '找不到系所資料' }, { status: 404 });
  }

  const { data: condition, error: condError } = await supabase
    .from('transfer_conditions')
    .select('*')
    .eq('department_id', id)
    .maybeSingle();

  if (condError) {
    console.error('❌ GET：讀取條件錯誤', condError.message);
  }

  const { data: quotas, error: quotaError } = await supabase
    .from('grade_quotas')
    .select('grade, quota')
    .eq('department_id', id);

  if (quotaError) {
    console.error('❌ GET：讀取名額錯誤', quotaError.message);
  }

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
    console.error('❌ PATCH：無效 ID', rawId);
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

  const { error: deptError } = await supabase
    .from('departments')
    .update({ department_name, category })
    .eq('department_id', id);

  if (deptError) {
    console.error('❌ PATCH 更新 department 失敗:', deptError.message);
    return NextResponse.json({ message: deptError.message }, { status: 500 });
  }

  const { error: condError } = await supabase
    .from('transfer_conditions')
    .upsert({
      department_id: id,
      exam_subjects,
      score_ratio,
      remarks,
    }, {
      onConflict: 'department_id',
    });

  if (condError) {
    console.error('❌ PATCH 更新 condition 失敗:', condError.message);
    return NextResponse.json({ message: condError.message }, { status: 500 });
  }

  const { error: delError } = await supabase
    .from('grade_quotas')
    .delete()
    .eq('department_id', id);

  if (delError) {
    console.error('❌ PATCH 刪除 quota 失敗:', delError.message);
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
    console.error('❌ PATCH 插入 quota 失敗:', insertError.message);
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  console.log('✅ PATCH 更新成功');
  return NextResponse.json({ message: '更新成功' });
}

// DELETE：刪除整筆資料
export async function DELETE(_: NextRequest, context: any) {
  const rawId = context.params?.id;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    console.error('❌ DELETE：無效 ID', rawId);
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
    console.error('❌ DELETE 發生錯誤:', firstError.message);
    return NextResponse.json({ message: firstError.message }, { status: 500 });
  }

  console.log('✅ DELETE 成功');
  return NextResponse.json({ message: '刪除成功' });
}
