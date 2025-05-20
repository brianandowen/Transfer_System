import { NextRequest, NextResponse } from 'next/server'; // ✅ Next.js 提供的 API Request/Response 類型
import { supabase } from '@/lib/supabase';               // ✅ 引入 Supabase 客戶端


// 取得轉系時程
export async function GET() {
  try {
    // 🔍 查詢 transfer_schedule 表中最新一筆資料（id 最大的那筆）
    const { data, error } = await supabase
      .from('transfer_schedule')
      .select('*')
      .order('id', { ascending: false }) // 按 id 由大到小排序
      .limit(1)                           // 只取 1 筆
      .single();                         // 如果資料為空會丟錯誤（須處理）

    // ❌ 若發生非空資料錯誤（如連線中斷、語法錯誤等），則丟出例外
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // ✅ 若查無資料（空表），回傳空物件
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('❌ 取得轉系時程失敗:', error);
    return NextResponse.json({ message: '資料讀取錯誤' }, { status: 500 });
  }
}
// 新增或更新轉系時程
export async function POST(req: NextRequest) {
  try {
    // 📨 從請求中解析傳入的資料
    const body = await req.json();
    const { academic_year, apply_period, document_deadline, announcement_date } = body;

    // ❌ 若有欄位缺漏，直接回傳 400 錯誤
    if (!academic_year || !apply_period || !document_deadline || !announcement_date) {
      return NextResponse.json({ message: '資料不完整' }, { status: 400 });
    }

    // 🔍 查詢目前是否已有資料存在（取最新一筆）
    const { data: existing, error: queryError } = await supabase
      .from('transfer_schedule')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single(); // 注意：沒資料會丟錯誤（須處理）

    if (queryError && queryError.code !== 'PGRST116') {
      throw queryError; // 不是查無資料錯誤就中止
    }

    if (existing) {
      // ✅ 若已有資料，執行更新動作
      const { error: updateError } = await supabase
        .from('transfer_schedule')
        .update({ academic_year, apply_period, document_deadline, announcement_date })
        .eq('id', existing.id); // 根據現有 ID 更新最新一筆

      if (updateError) throw updateError;
    } else {
      // ➕ 若無任何資料，執行插入新資料
      const { error: insertError } = await supabase
        .from('transfer_schedule')
        .insert([{ academic_year, apply_period, document_deadline, announcement_date }]);

      if (insertError) throw insertError;
    }

    // ✅ 儲存成功
    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('❌ 更新轉系時程失敗:', error);
    return NextResponse.json({ message: '儲存失敗' }, { status: 500 });
  }
}
