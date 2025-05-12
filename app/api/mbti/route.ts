import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Missing MBTI type' }, { status: 400 });
  }

  try {
    const [rows]: [any[], any] = await db.query(
      `SELECT 
  d.department_id,
  d.department_name AS name,
  d.category AS group_name,
  r.reason,
  r.recommend_type
FROM mbti_recommendations r
JOIN departments d ON r.department_id = d.department_id
WHERE r.mbti_type = ?
ORDER BY r.recommend_type DESC
`,
      [type]
    );

    const best = rows.filter(row => row.recommend_type === 'suitable');
    const worst = rows.filter(row => row.recommend_type === 'unsuitable');

    return NextResponse.json({ best, worst });
  } catch (err) {
    console.error('❌ 查詢錯誤:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
