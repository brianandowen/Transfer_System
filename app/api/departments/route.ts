import { NextRequest, NextResponse } from 'next/server'; // ✅ 引入 Next.js API 處理用類型與工具
import { supabase } from '@/lib/supabase';               // ✅ 匯入 Supabase 客戶端（已設定好連線資訊）

// ✅ GET 方法：取得所有系所資料
export async function GET() {
  // 🔍 查詢 "departments" 表，取得所有欄位與所有資料列
  const { data, error } = await supabase
    .from('departments')
    .select('*'); // 回傳欄位包含：department_id, department_name, category

  // ❌ 若查詢失敗（例如資料庫錯誤、網路錯誤等）
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // 回傳 500 錯誤與錯誤訊息
  }

  // ✅ 查詢成功則回傳所有資料（陣列形式）
  return NextResponse.json(data); // 前端收到的是一組 department 陣列
}

// ✅ POST 方法：新增一筆系所資料
export async function POST(req: NextRequest) {
  // 📨 從請求中解析 JSON 內容，預期包含：department_id, department_name, category
  const body = await req.json();

  // ➕ 將資料插入到 "departments" 表，格式需為陣列（即使只有一筆也需包 []）
  const { error } = await supabase
    .from('departments')
    .insert([body]); // body 格式範例見下方補充

  // ❌ 若新增過程有錯（例如 UNIQUE 衝突、欄位缺漏）
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // 回傳 500 錯誤與錯誤訊息
  }

  // ✅ 新增成功回傳標準訊息
  return NextResponse.json({ message: '新增成功' });
}
