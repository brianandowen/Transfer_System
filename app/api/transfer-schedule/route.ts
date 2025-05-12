import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: 取得轉系時程
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM transfer_schedule ORDER BY id DESC LIMIT 1') as any[];
    return NextResponse.json(rows[0] || {});
  } catch (error) {
    console.error('❌ 取得轉系時程失敗:', error);
    return NextResponse.json({ message: '資料讀取錯誤' }, { status: 500 });
  }
}

// POST: 新增或更新
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { academic_year, apply_period, document_deadline, announcement_date } = body;

    if (!academic_year || !apply_period || !document_deadline || !announcement_date) {
      return NextResponse.json({ message: '資料不完整' }, { status: 400 });
    }

    const [rows] = await db.query('SELECT id FROM transfer_schedule ORDER BY id DESC LIMIT 1') as any[];

    if (rows.length > 0) {
      await db.query(
        `UPDATE transfer_schedule SET academic_year=?, apply_period=?, document_deadline=?, announcement_date=? WHERE id=?`,
        [academic_year, apply_period, document_deadline, announcement_date, rows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO transfer_schedule (academic_year, apply_period, document_deadline, announcement_date) VALUES (?, ?, ?, ?)`,
        [academic_year, apply_period, document_deadline, announcement_date]
      );
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('❌ 更新轉系時程失敗:', error);
    return NextResponse.json({ message: '儲存失敗' }, { status: 500 });
  }
}
