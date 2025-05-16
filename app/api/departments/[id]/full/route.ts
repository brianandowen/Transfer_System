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
// 查詢 transfer_conditions 是否有資料
const { data: existingCond, error: checkCondError } = await supabase
  .from('transfer_conditions')
  .select('condition_id')
  .eq('department_id', id)
  .maybeSingle();

if (checkCondError) {
  console.error('❌ 讀取 transfer_conditions 錯誤:', checkCondError);
  return NextResponse.json({ message: checkCondError.message }, { status: 500 });
}

// ❗ 有資料就刪除（保險處理，防止 UNIQUE 錯誤）
if (existingCond) {
  console.log('🧹 刪除舊的 transfer_conditions, condition_id =', existingCond.condition_id);
  const { error: delCondError } = await supabase
    .from('transfer_conditions')
    .delete()
    .eq('department_id', id);

  if (delCondError) {
    console.error('❌ 刪除 transfer_conditions 失敗:', delCondError);
    return NextResponse.json({ message: delCondError.message }, { status: 500 });
  }
}

// ✅ 插入新的 transfer_conditions（保證唯一）
const { error: insertCondError } = await supabase
  .from('transfer_conditions')
  .insert({
    department_id: id,
    exam_subjects,
    score_ratio,
    remarks,
  });

if (insertCondError) {
  console.error('❌ 插入 transfer_conditions 失敗:', insertCondError);
  return NextResponse.json({ message: insertCondError.message }, { status: 500 });
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
