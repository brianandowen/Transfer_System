import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Entry = {
  department_id: string;
  mbti_type: string;
  recommend_type: 'suitable' | 'unsuitable';
  reason: string;
};

// 🔁 POST: 批次寫入推薦資料
export async function POST(req: NextRequest) {
  try {
    const entries: Entry[] = await req.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const departmentIds = entries.map(e => e.department_id);

    // 查詢對應系所的 category
    const { data: deptRows, error: deptError } = await supabase
      .from('departments')
      .select('department_id, category')
      .in('department_id', departmentIds);

    if (deptError) {
      console.error('❌ 部門查詢錯誤:', deptError);
      return NextResponse.json({ message: '查詢錯誤' }, { status: 500 });
    }

    const deptMap = Object.fromEntries(
      (deptRows || []).map(row => [row.department_id, row.category])
    );

    const insertValues = entries.map(entry => ({
      department_id: entry.department_id,
      mbti_type: entry.mbti_type,
      recommend_type: entry.recommend_type,
      reason: entry.reason,
      group_name: deptMap[entry.department_id] || null,
    }));

    const { error: insertError } = await supabase
      .from('mbti_recommendations')
      .insert(insertValues);

    if (insertError) {
      console.error('❌ 寫入失敗:', insertError);
      return NextResponse.json({ message: '寫入失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('❌ 發生例外錯誤:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// 🔍 GET: 根據 MBTI 查推薦結果
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Missing MBTI type' }, { status: 400 });
  }

  try {
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
      .order('recommend_type');

    if (error || !data) {
      console.error('❌ 查詢錯誤:', error);
      return NextResponse.json({ error: error?.message || '找不到資料' }, { status: 500 });
    }

    type Row = {
      department_id: string;
      reason: string;
      recommend_type: 'suitable' | 'unsuitable';
      departments: {
        department_name: string;
        category: string;
      } | null;
    };

    const rows = data as unknown as Row[];

    const best = rows
      .filter(r => r.recommend_type === 'suitable')
      .map(r => ({
        department_id: r.department_id,
        name: r.departments?.department_name || '',
        group: r.departments?.category || '',
        reason: r.reason,
      }));

    const worst = rows
      .filter(r => r.recommend_type === 'unsuitable')
      .map(r => ({
        department_id: r.department_id,
        name: r.departments?.department_name || '',
        group: r.departments?.category || '',
        reason: r.reason,
      }));

    return NextResponse.json({ best, worst });
  } catch (err) {
    console.error('❌ Failed to fetch MBTI results:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
