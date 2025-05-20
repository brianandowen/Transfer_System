import { NextRequest, NextResponse } from 'next/server'; // ✅ Next.js 用於處理 API 請求與回應的核心工具
import { supabase } from '@/lib/supabase';               // ✅ 引入初始化好的 Supabase 客戶端連線

// ✅ 定義每筆推薦資料的結構
type Entry = {
  department_id: string;                        // 系所 ID，對應 departments 表
  mbti_type: string;                            // MBTI 類型（如 ENFP、ISTJ）
  recommend_type: 'suitable' | 'unsuitable';    // 推薦類型（適合 / 不適合）
  reason: string;                               // 推薦原因
};

// ✅ POST 方法：批次寫入 MBTI 推薦資料
export async function POST(req: NextRequest) {
  try {
    // 📨 接收前端送來的 JSON 陣列資料
    const entries: Entry[] = await req.json();

    // ❌ 如果資料格式不正確（不是陣列或為空），回傳 400
    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    // 🔍 擷取所有用到的 department_id，稍後用來查對應的 category
    const departmentIds = entries.map(e => e.department_id);

    // 🔍 查詢這些系所的 category 資料（用於補 group_name 欄位）
    const { data: deptRows, error: deptError } = await supabase
      .from('departments')
      .select('department_id, category')
      .in('department_id', departmentIds);

    if (deptError) {
      console.error('❌ 部門查詢錯誤:', deptError);
      return NextResponse.json({ message: '查詢錯誤' }, { status: 500 });
    }

    // ✅ 建立 department_id → category 的映射表（Map）
    const deptMap = Object.fromEntries(
      (deptRows || []).map(row => [row.department_id, row.category])
    );

    // 📦 將推薦資料轉換成可插入的格式，並補上對應的 group_name
    const insertValues = entries.map(entry => ({
      department_id: entry.department_id,
      mbti_type: entry.mbti_type,
      recommend_type: entry.recommend_type,
      reason: entry.reason,
      group_name: deptMap[entry.department_id] || null, // 若查不到則為 null
    }));

    // ➕ 插入資料到 mbti_recommendations 表
    const { error: insertError } = await supabase
      .from('mbti_recommendations')
      .insert(insertValues);

    // ❌ 插入失敗
    if (insertError) {
      console.error('❌ 寫入失敗:', insertError);
      return NextResponse.json({ message: '寫入失敗' }, { status: 500 });
    }

    // ✅ 寫入成功
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    // ❌ 例外處理（例如 JSON 解析錯、網路錯誤等）
    console.error('❌ 發生例外錯誤:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// ✅ GET 方法：依 MBTI 類型查詢推薦與不推薦的系所清單
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);   // 從 URL 中取得查詢參數
  const type = searchParams.get('type');       // 取得 MBTI 類型（如 INFP）

  // ❌ 沒有給 MBTI 類型，回傳 400
  if (!type) {
    return NextResponse.json({ error: 'Missing MBTI type' }, { status: 400 });
  }

  try {
    // 🔍 查詢 mbti_recommendations 並 JOIN departments 表取得系所名稱與學群
    const { data, error } = await supabase
      .from('mbti_recommendations')
      .select(`
        department_id,
        reason,
        recommend_type,
        departments:department_id (
          department_name,
          category
        )
      `)
      .eq('mbti_type', type)
      .order('recommend_type'); // 排序讓 suitable 在前

    if (error || !data) {
      console.error('❌ 查詢錯誤:', error);
      return NextResponse.json({ error: error?.message || '找不到資料' }, { status: 500 });
    }

    // ✅ 定義內部型別（含 JOIN 結果）
    type Row = {
      department_id: string;
      reason: string;
      recommend_type: 'suitable' | 'unsuitable';
      departments: {
        department_name: string;
        category: string;
      } | null;
    };

    const rows = data as unknown as Row[]; // 類型斷言

    // ✅ 篩選出「適合」清單
    const best = rows
      .filter(r => r.recommend_type === 'suitable')
      .map(r => ({
        department_id: r.department_id,
        name: r.departments?.department_name || '',
        group: r.departments?.category || '',
        reason: r.reason,
      }));

    // ✅ 篩選出「不適合」清單
    const worst = rows
      .filter(r => r.recommend_type === 'unsuitable')
      .map(r => ({
        department_id: r.department_id,
        name: r.departments?.department_name || '',
        group: r.departments?.category || '',
        reason: r.reason,
      }));

    // ✅ 回傳兩組資料
    return NextResponse.json({ best, worst });
  } catch (err) {
    // ❌ 捕捉所有未預期錯誤
    console.error('❌ Failed to fetch MBTI results:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
