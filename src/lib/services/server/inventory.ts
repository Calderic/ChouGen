import { createClient } from '@/lib/supabase/server';
import type { Profile, CigarettePack } from '@/types/database';

/**
 * 库存页面数据获取（服务端）
 */
export async function getInventoryPageData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 并行获取所有数据
  const [profileResult, activePacksResult, emptyPacksResult] = await Promise.all([
    // 用户资料
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    // 当前口粮（剩余数量 > 0）
    supabase
      .from('cigarette_packs')
      .select('*')
      .eq('user_id', user.id)
      .gt('remaining_count', 0)
      .order('created_at', { ascending: false }),

    // 已抽完的（剩余数量 = 0）
    supabase
      .from('cigarette_packs')
      .select('*')
      .eq('user_id', user.id)
      .eq('remaining_count', 0)
      .order('updated_at', { ascending: false }),
  ]);

  return {
    profile: profileResult.data as Profile | null,
    activePacks: (activePacksResult.data || []) as CigarettePack[],
    emptyPacks: (emptyPacksResult.data || []) as CigarettePack[],
  };
}

/**
 * 库存详情页面数据获取（服务端）
 */
export async function getInventoryDetailPageData(packId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 并行获取数据
  const [profileResult, packResult, recordsResult] = await Promise.all([
    // 用户资料
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    // 香烟包详情
    supabase.from('cigarette_packs').select('*').eq('id', packId).single(),

    // 该香烟包的抽烟记录
    supabase
      .from('smoking_records')
      .select('*')
      .eq('pack_id', packId)
      .order('smoked_at', { ascending: false }),
  ]);

  // 验证香烟包是否属于当前用户
  if (packResult.data && packResult.data.user_id !== user.id) {
    return null;
  }

  return {
    profile: profileResult.data as Profile | null,
    pack: packResult.data,
    records: recordsResult.data || [],
  };
}
