import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type MBTIResultRow = {
  department_id: string;
  reason: string;
  recommend_type: 'suitable' | 'unsuitable';
  departments: {
    department_name: string;
    category: string;
  } | null;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Missing MBTI type' }, { status: 400 });
  }

  try {
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
      .eq('mbti_type', type)
      .order('recommend_type', { ascending: false }); // DESC 排序

    const data = response.data as MBTIResultRow[] | null;
    const error = response.error;

    if (error || !data) {
      return NextResponse.json({ error: error?.message || '找不到資料' }, { status: 500 });
    }

    const best = data
      .filter(row => row.recommend_type === 'suitable')
      .map(row => ({
        department_id: row.department_id,
        name: row.departments?.department_name || '',
        group_name: row.departments?.category || '',
        reason: row.reason,
      }));

    const worst = data
      .filter(row => row.recommend_type === 'unsuitable')
      .map(row => ({
        department_id: row.department_id,
        name: row.departments?.department_name || '',
        group_name: row.departments?.category || '',
        reason: row.reason,
      }));

    return NextResponse.json({ best, worst });
  } catch (err) {
    console.error('❌ 查詢錯誤:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
