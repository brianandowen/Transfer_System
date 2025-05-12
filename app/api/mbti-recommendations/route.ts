import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Entry = {
  department_id: string;
  mbti_type: string;
  recommend_type: 'suitable' | 'unsuitable';
  reason: string;
};

export async function POST(req: NextRequest) {
  try {
    const entries: Entry[] = await req.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      console.error('❌ Invalid payload:', entries);
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const departmentIds = entries.map(e => e.department_id);
    console.log('📦 Received entries:', entries);
    console.log('📚 Department IDs to lookup:', departmentIds);

    // 查詢對應系所的 category
    const [deptRows] = await db.query(
      `SELECT department_id, category FROM departments WHERE department_id IN (?)`,
      [departmentIds]
    );

    console.log('🎓 Retrieved department categories:', deptRows);

    const deptMap = Object.fromEntries(
      (deptRows as any[]).map(row => [row.department_id, row.category])
    );

    const values = entries.map(({ department_id, mbti_type, recommend_type, reason }) => [
      department_id,
      mbti_type,
      recommend_type,
      reason,
      deptMap[department_id] || null,
    ]);

    console.log('🛠️ Prepared INSERT values:', values);

    const sql = `
      INSERT INTO mbti_recommendations
      (department_id, mbti_type, recommend_type, reason, group_name)
      VALUES ?
    `;

    await db.query(sql, [values]);

    console.log('✅ Successfully inserted MBTI recommendations');
    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error inserting MBTI recommendations:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Missing MBTI type' }, { status: 400 });
  }

  try {
    const [rows]: [any[], any] = await db.query(
      `SELECT 
        d.department_id AS department_id,
        d.department_name AS name,
        d.category AS group,
        r.reason,
        r.recommend_type
      FROM mbti_recommendations r
      JOIN departments d ON r.department_id = d.department_id
      WHERE r.mbti_type = ?
      ORDER BY r.recommend_type`,
      [type]
    );

    const best = rows.filter(r => r.recommend_type === 'suitable');
    const worst = rows.filter(r => r.recommend_type === 'unsuitable');

    return NextResponse.json({ best, worst });
  } catch (err) {
    console.error('❌ Failed to fetch MBTI results:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
