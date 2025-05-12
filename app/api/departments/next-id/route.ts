// /app/api/departments/next-id/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows]: [any[], any] = await db.query(
      'SELECT MAX(department_id) AS max_id FROM departments'
    );
    const nextId = (rows[0]?.max_id || 0) + 1;

    return NextResponse.json({ next_id: nextId });
  } catch (err: any) {
    console.error('❌ 無法取得下一個 ID:', err);
    return NextResponse.json({ message: '取得失敗', error: err.message }, { status: 500 });
  }
}
