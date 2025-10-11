import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/smoking-records/:id  删除抽烟记录（服务端执行）
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Next.js 15: params 是 Promise
    if (!id) {
      return NextResponse.json({ error: '缺少 id' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 先取记录，拿到 pack_id
    const { data: record, error: fetchError } = await supabase
      .from('smoking_records')
      .select('id, user_id, pack_id')
      .eq('id', id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }
    if (record.user_id !== user.id) {
      return NextResponse.json({ error: '无权删除该记录' }, { status: 403 });
    }

    // 删除记录
    const { error: deleteError } = await supabase.from('smoking_records').delete().eq('id', id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 回退口粮剩余（如果没有触发器处理删除，这里做补偿。若有触发器，这段可以移除）
    const { data: pack, error: packError } = await supabase
      .from('cigarette_packs')
      .select('remaining_count')
      .eq('id', record.pack_id)
      .single();

    if (!packError && pack) {
      await supabase
        .from('cigarette_packs')
        .update({ remaining_count: pack.remaining_count + 1, updated_at: new Date().toISOString() })
        .eq('id', record.pack_id);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const error = e instanceof Error ? e.message : '服务器错误';
    return NextResponse.json({ error }, { status: 500 });
  }
}
