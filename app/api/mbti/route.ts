import { NextRequest, NextResponse } from 'next/server'; // ✅ Next.js 的 API 請求與回應工具
import { supabase } from '@/lib/supabase';               // ✅ 已初始化的 Supabase 客戶端

// ✅ 定義回傳資料的型別，用於類型提示
type MBTIResultRow = {
  department_id: string;
  reason: string;
  recommend_type: 'suitable' | 'unsuitable';  // 分為適合與不適合
  departments: {
    department_name: string;
    category: string;
  } | null;
};

// ✅ GET 方法：依據 MBTI 類型查詢推薦或不推薦的系所
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);      // 取得 URL 中的查詢參數
  const type = searchParams.get('type');          // 擷取 MBTI 類型參數（例如 ENFP）

  // ❌ 若未提供 MBTI 類型，回傳 400 錯誤
  if (!type) {
    return NextResponse.json({ error: 'Missing MBTI type' }, { status: 400 });
  }

  try {
    // 🔍 查詢 mbti_recommendations 表，並透過 foreign key 對應到 departments 表資料
    const response = await supabase
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
      .eq('mbti_type', type) // 對應指定的 MBTI 類型
      .order('recommend_type', { ascending: false }); // DESC 排序（適合的在前）

    const data = response.data as MBTIResultRow[] | null;
    const error = response.error;

    // ❌ 若查詢失敗或沒有資料
    if (error || !data) {
      return NextResponse.json({ error: error?.message || '找不到資料' }, { status: 500 });
    }

    // ✅ 篩選出「適合」的系所清單
    const best = data
      .filter(row => row.recommend_type === 'suitable')
      .map(row => ({
        department_id: row.department_id,
        name: row.departments?.department_name || '',
        group_name: row.departments?.category || '',
        reason: row.reason,
      }));

    // ✅ 篩選出「不適合」的系所清單
    const worst = data
      .filter(row => row.recommend_type === 'unsuitable')
      .map(row => ({
        department_id: row.department_id,
        name: row.departments?.department_name || '',
        group_name: row.departments?.category || '',
        reason: row.reason,
      }));

    // ✅ 將兩組清單回傳給前端
    return NextResponse.json({ best, worst });
  } catch (err) {
    // ❌ 例外錯誤處理（例如連線中斷等非 Supabase 的錯誤）
    console.error('❌ 查詢錯誤:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
