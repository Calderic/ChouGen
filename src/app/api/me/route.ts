import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/me  获取当前用户基础信息
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ id: null }, { status: 200 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    id: user.id,
    username: profile?.username ?? null,
    avatar_url: profile?.avatar_url ?? null,
  });
}
