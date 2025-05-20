import { supabase } from '@/lib/supabase';           // ✅ 匯入已設定好的 Supabase 客戶端
import { NextResponse } from 'next/server';          // ✅ 用來建立標準化 HTTP 回應

// ✅ GET 方法：取得目前最大 department_id 並產生下一個可用的 ID
export async function GET() {
  // 🔍 從 "departments" 表選取 department_id 欄位，按照遞減排序，僅取出一筆（最大值）
  const { data, error } = await supabase
    .from('departments')
    .select('department_id')                        // 只取出 ID 欄位
    .order('department_id', { ascending: false })   // 按照 ID 遞減排序（最大在最前）
    .limit(1);                                      // 只取最前面那一筆

  // ❌ 若查詢過程發生錯誤，回傳 500 錯誤與錯誤訊息
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // ✅ 正常取得資料時，取出目前最大的 department_id
  const lastId = Number(data?.[0]?.department_id || 0); // 若查無資料則預設為 0
  const next_id = lastId + 1;                           // 下一個可用 ID（自動編號）

  // ✅ 回傳格式：{ next_id: 整數 }
  return NextResponse.json({ next_id });
}
