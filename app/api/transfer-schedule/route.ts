import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 取得轉系時程
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('transfer_schedule')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(data || {});
  } catch (error) {
    console.error('❌ 取得轉系時程失敗:', error);
    return NextResponse.json({ message: '資料讀取錯誤' }, { status: 500 });
  }
}

// 新增或更新轉系時程
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { academic_year, apply_period, document_deadline, announcement_date } = body;

    if (!academic_year || !apply_period || !document_deadline || !announcement_date) {
      return NextResponse.json({ message: '資料不完整' }, { status: 400 });
    }

    // 先查最新一筆
    const { data: existing, error: queryError } = await supabase
      .from('transfer_schedule')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      throw queryError;
    }

    if (existing) {
      // 有資料就更新
      const { error: updateError } = await supabase
        .from('transfer_schedule')
        .update({ academic_year, apply_period, document_deadline, announcement_date })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // 沒資料就新增
      const { error: insertError } = await supabase
        .from('transfer_schedule')
        .insert([{ academic_year, apply_period, document_deadline, announcement_date }]);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('❌ 更新轉系時程失敗:', error);
    return NextResponse.json({ message: '儲存失敗' }, { status: 500 });
  }
}
