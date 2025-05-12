import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM departments');
    return NextResponse.json({ departments: rows });
  } catch (error: any) {
    console.error('❌ 讀取失敗:', error);
    return NextResponse.json(
      { message: '讀取失敗', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { department_id, department_name, category } = body;

    if (!department_id || !department_name || !category) {
      return NextResponse.json({ message: '❌ 所有欄位皆為必填' }, { status: 400 });
    }

    const [result] = await db.execute(
      'INSERT INTO departments (department_id, department_name, category) VALUES (?, ?, ?)',
      [department_id, department_name, category]
    ) as [ResultSetHeader, any];

    return NextResponse.json({
      message: '✅ 寫入成功',
      affectedRows: result.affectedRows,
      insertId: result.insertId,
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ SQL 寫入失敗:', error);
    return NextResponse.json({
      message: '🚨 寫入失敗',
      error: error?.sqlMessage || error?.message || String(error),
    }, { status: 500 });
  }
}