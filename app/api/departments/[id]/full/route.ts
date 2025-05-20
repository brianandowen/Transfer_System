import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ✅ GET 方法：取得指定 ID 的完整系所資料（含轉系條件與名額）
export async function GET(_: NextRequest, context: any) {
  const rawId = context.params?.id;        // 從 route 參數中取得系所 ID（為字串）
  const id = Number(rawId);                // 轉為數字型別以便查詢

  // 若 ID 無效（NaN 或 0），則回傳錯誤
  if (!id || isNaN(id)) {
    console.error('❌ GET：無效 ID', rawId);
    return NextResponse.json({ message: '系所 ID 無效' }, { status: 400 });
  }

  // 🔍 查詢 departments 表，取得該系所的基本資料
  const { data: department, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .eq('department_id', id)
    .single(); // 保證只取一筆

  // 若查詢錯誤或資料不存在
  if (deptError || !department) {
    console.error('❌ GET：找不到系所', deptError?.message);
    return NextResponse.json({ message: '找不到系所資料' }, { status: 404 });
  }

  // 🔍 查詢該系所的轉系條件（可能沒有）
  const { data: condition, error: condError } = await supabase
    .from('transfer_conditions')
    .select('*')
    .eq('department_id', id)
    .maybeSingle(); // 若無資料則為 null

  if (condError) {
    console.error('❌ GET：讀取條件錯誤', condError.message);
  }

  // 🔍 查詢各年級的名額資料
  const { data: quotas, error: quotaError } = await supabase
    .from('grade_quotas')
    .select('grade, quota')
    .eq('department_id', id);

  if (quotaError) {
    console.error('❌ GET：讀取名額錯誤', quotaError.message);
  }

  // 🧾 回傳整合資料（主資料 + 條件 + 名額）
  return NextResponse.json({
    ...department,
    exam_subjects: condition?.exam_subjects || '',
    score_ratio: condition?.score_ratio || {},
    remarks: condition?.remarks || '',
    quotas: quotas || [],
  });
}

// ✅ PATCH 方法：更新指定系所的完整資料
export async function PATCH(req: NextRequest, context: any) {
  const rawId = context.params?.id;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    console.error('❌ PATCH：無效 ID', rawId);
    return NextResponse.json({ message: '系所 ID 無效' }, { status: 400 });
  }

  // 📨 取得前端傳來的 JSON 資料
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

  // 🛠️ 更新 departments 表（名稱與分類）
  const { error: deptError } = await supabase
    .from('departments')
    .update({ department_name, category })
    .eq('department_id', id);

  if (deptError) {
    console.error('❌ 更新 departments 失敗:', deptError);
    return NextResponse.json({ message: deptError.message }, { status: 500 });
  }

  // 🔍 檢查該系所是否已有 transfer_conditions 資料
  const { data: existingCond, error: checkCondError } = await supabase
    .from('transfer_conditions')
    .select('condition_id')
    .eq('department_id', id)
    .maybeSingle();

  if (checkCondError) {
    console.error('❌ 讀取 transfer_conditions 錯誤:', checkCondError);
    return NextResponse.json({ message: checkCondError.message }, { status: 500 });
  }

  // 🧹 若已有資料，先刪除舊的條件資料（避免 UNIQUE constraint 衝突）
  if (existingCond) {
    const { error: delCondError } = await supabase
      .from('transfer_conditions')
      .delete()
      .eq('department_id', id);

    if (delCondError) {
      console.error('❌ 刪除 transfer_conditions 失敗:', delCondError);
      return NextResponse.json({ message: delCondError.message }, { status: 500 });
    }
  }

  // ➕ 插入新的條件資料
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

  // 🧹 刪除原有的名額資料
  const { error: delError } = await supabase
    .from('grade_quotas')
    .delete()
    .eq('department_id', id);

  if (delError) {
    console.error('❌ 刪除 grade_quotas 失敗:', delError);
    return NextResponse.json({ message: delError.message }, { status: 500 });
  }

  // 📦 將新的 quotas 格式化後插入
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
    console.error('❌ 插入 grade_quotas 失敗:', insertError);
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  console.log('✅ PATCH 更新成功');
  return NextResponse.json({ message: '更新成功' });
}
