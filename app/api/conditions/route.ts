import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: [any[], any] = await db.query(`
      SELECT
        d.department_id,
        d.department_name,
        d.category,
        tc.exam_subjects,
        tc.score_ratio,
        tc.remarks,
        gq.grade,
        gq.quota
      FROM departments d
      LEFT JOIN transfer_conditions tc ON d.department_id = tc.department_id
      LEFT JOIN grade_quotas gq ON d.department_id = gq.department_id
      ORDER BY d.department_id, gq.grade;
    `);

    const data = rows.reduce((acc: any[], row: any) => {
      let existing = acc.find(item => item.department_id === row.department_id);

      if (!existing) {
        let parsedRatio = {};
        try {
          parsedRatio = row.score_ratio ? JSON.parse(row.score_ratio) : {};
        } catch {
          parsedRatio = {};
        }

        existing = {
          department_id: row.department_id,
          department_name: row.department_name,
          category: row.category,
          exam_subjects: row.exam_subjects || '',
          score_ratio: parsedRatio,
          remarks: row.remarks || '',
          quotas: [],
        };

        acc.push(existing);
      }

      if (row.grade !== null && row.quota !== null) {
        existing.quotas.push({
          grade: row.grade,
          quota: row.quota,
        });
      }

      return acc;
    }, []);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ /api/conditions 資料庫查詢錯誤:', error);
    return new Response('資料庫查詢錯誤', { status: 500 });
  }
}
