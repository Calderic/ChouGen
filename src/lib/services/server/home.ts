import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile, CigarettePack } from '@/types/database';
import type { SmokingRecordWithPack } from '@/lib/services/smoking-records';

/**
 * 首页数据获取（服务端）
 * 使用 React cache() 在同一个请求中复用数据
 */
export const getHomePageData = cache(async () => {
  const supabase = await createClient();

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 并行获取所有数据（服务端内网速度快）
  const [profileResult, packsResult, recordsResult, statsResult] = await Promise.all([
    // 用户资料
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    // 当前口粮
    supabase
      .from('cigarette_packs')
      .select('*')
      .eq('user_id', user.id)
      .gt('remaining_count', 0)
      .order('created_at', { ascending: false }),

    // 今日记录
    supabase
      .from('smoking_records')
      .select(
        `
        *,
        pack:cigarette_packs!smoking_records_pack_id_fkey (
          name,
          brand
        )
      `
      )
      .eq('user_id', user.id)
      .gte('smoked_at', new Date().toISOString().split('T')[0])
      .order('smoked_at', { ascending: false }),

    // 统计数据
    supabase.rpc('get_user_stats', { target_user_id: user.id }),
  ]);

  // 处理统计数据
  const stats = statsResult.data?.[0] || null;

  return {
    profile: profileResult.data as Profile | null,
    activePacks: (packsResult.data || []) as CigarettePack[],
    todayRecords: (recordsResult.data || []) as SmokingRecordWithPack[],
    stats: stats
      ? {
          today: {
            count: stats.today_smokes,
            cost: Number(stats.today_cost),
          },
          week: {
            count: stats.week_smokes,
            cost: Number(stats.week_cost),
          },
          month: {
            count: stats.month_smokes,
            cost: Number(stats.month_cost),
          },
        }
      : {
          today: { count: 0, cost: 0 },
          week: { count: 0, cost: 0 },
          month: { count: 0, cost: 0 },
        },
  };
});
