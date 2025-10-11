import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/smoking-records  创建抽烟记录（服务端执行，避免在客户端直连 Supabase）
export async function POST(req: Request) {
  try {
    const { packId, smokedAt } = (await req.json()) as { packId?: string; smokedAt?: string };

    if (!packId) {
      return NextResponse.json({ error: '缺少 packId' }, { status: 400 });
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

    // 读包信息用于计算成本与校验库存
    const { data: pack, error: packError } = await supabase
      .from('cigarette_packs')
      .select('price, total_count, remaining_count, name, brand')
      .eq('id', packId)
      .single();

    if (packError || !pack) {
      return NextResponse.json({ error: '香烟包不存在' }, { status: 404 });
    }
    if (pack.remaining_count <= 0) {
      return NextResponse.json({ error: '香烟包已抽完' }, { status: 400 });
    }

    const costPerCigarette = pack.price / pack.total_count;
    const smokedISO = smokedAt ? new Date(smokedAt).toISOString() : new Date().toISOString();

    const { data, error } = await supabase
      .from('smoking_records')
      .insert({
        user_id: user.id,
        pack_id: packId,
        smoked_at: smokedISO,
        cost: costPerCigarette,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    const error = e instanceof Error ? e.message : '服务器错误';
    return NextResponse.json({ error }, { status: 500 });
  }
}
