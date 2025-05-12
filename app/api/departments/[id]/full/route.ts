import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: 撈一筆完整資料（基本資料 + 條件 + 名額）
export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  try {
    const [deptRows]: [any[], any] = await db.query(
      'SELECT * FROM departments WHERE department_id = ?', [id]
    );
    const [condRows]: [any[], any] = await db.query(
      'SELECT * FROM transfer_conditions WHERE condition_id = ?', [id]
    );
    const [quotaRows]: [any[], any] = await db.query(
      'SELECT grade, quota FROM grade_quotas WHERE department_id = ?', [id]
    );

    const department = deptRows[0];
    const condition = condRows[0];

    if (!department) {
      return NextResponse.json({ message: '找不到系所' }, { status: 404 });
    }

    return NextResponse.json({
      department_id: department.department_id,
      department_name: department.department_name,
      category: department.category,
      exam_subjects: condition?.exam_subjects || '',
      score_ratio: (() => {
        try {
          if (!condition?.score_ratio) return [];
          return typeof condition.score_ratio === 'string'
            ? JSON.parse(condition.score_ratio)
            : condition.score_ratio;
        } catch {
          return [];
        }
      })(),
      remarks: condition?.remarks || '',
      quotas: quotaRows || []
    });
  } catch (err: any) {
    console.error('❌ GET 錯誤:', err);
    return NextResponse.json(
      { message: '伺服器錯誤', error: err.message },
      { status: 500 }
    );
  }
}

// PATCH: 更新（基本 + 條件 + 名額）
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ message: '❌ 缺少部門 ID' }, { status: 400 });
  }

  const body = await req.json();
  const { department_name, category, exam_subjects, score_ratio, remarks, quotas } = body;

  const conn = await db.getConnection();

  try {
    console.log('📥 [PATCH] id:', id);
    console.log('📥 [PATCH] body:', body);

    await conn.beginTransaction();
    console.log('✅ 已開始 transaction');

    // 更新基本資料
    console.log('👉 更新 departments...');
    await conn.execute(
      'UPDATE departments SET department_name = ?, category = ? WHERE department_id = ?',
      [department_name, category, id]
    );
    console.log('✅ 更新 departments 成功');

    // upsert 條件（✅ 包含 department_id）
    console.log('👉 更新 transfer_conditions...');
    await conn.execute(
      `INSERT INTO transfer_conditions (condition_id, department_id, exam_subjects, score_ratio, remarks)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         exam_subjects = VALUES(exam_subjects),
         score_ratio = VALUES(score_ratio),
         remarks = VALUES(remarks)`,
      [id, id, exam_subjects, JSON.stringify(score_ratio), remarks]
    );
    console.log('✅ 更新 transfer_conditions 成功');

    // 刪除舊名額
    console.log('👉 刪除舊 grade_quotas...');
    await conn.execute('DELETE FROM grade_quotas WHERE department_id = ?', [id]);
    console.log('✅ 刪除成功');

    // 插入新名額
    console.log('👉 新增 grade_quotas...');
    const validQuotas = Array.isArray(quotas)
      ? quotas.filter(q => q.grade && q.quota)
      : [];

    for (const q of validQuotas) {
      console.log(`🔹 插入 quota: grade=${q.grade}, quota=${q.quota}`);
      await conn.execute(
        'INSERT INTO grade_quotas (department_id, grade, quota) VALUES (?, ?, ?)',
        [id, q.grade, q.quota]
      );
    }
    console.log('✅ 新增 grade_quotas 成功');

    await conn.commit();
    console.log('✅ 提交成功');
    return NextResponse.json({ message: '✅ 更新成功' });

  } catch (err: any) {
    await conn.rollback();
    console.error('❌ PATCH 發生錯誤:');
    console.error('🔻 錯誤訊息:', err?.message);
    console.error('🔻 錯誤完整:', err);
    return NextResponse.json(
      { message: err?.message || '伺服器錯誤' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
// DELETE: 刪除該部門（包含條件與名額）
export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ message: '❌ 缺少部門 ID' }, { status: 400 });
  }

  const conn = await db.getConnection();

  try {
    console.log('🗑️ [DELETE] 準備刪除 department_id:', id);
    await conn.beginTransaction();

    // 刪除名額、條件、主資料
    await conn.execute('DELETE FROM grade_quotas WHERE department_id = ?', [id]);
    await conn.execute('DELETE FROM transfer_conditions WHERE condition_id = ?', [id]);
    await conn.execute('DELETE FROM departments WHERE department_id = ?', [id]);

    await conn.commit();
    console.log('✅ 刪除成功:', id);
    return NextResponse.json({ message: '✅ 刪除成功' });
  } catch (err: any) {
    await conn.rollback();
    console.error('❌ DELETE 發生錯誤:', err);
    return NextResponse.json({ message: err?.message || '刪除失敗' }, { status: 500 });
  } finally {
    conn.release();
  }
}

