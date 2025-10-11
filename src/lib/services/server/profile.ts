import { createClient } from '@/lib/supabase/server';
import type { Profile, AchievementWithStatus } from '@/types/database';

/**
 * 个人资料页面数据获取（服务端）
 */
export async function getProfilePageData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 并行获取所有数据
  const [profileResult, statsResult, achievementsResult] = await Promise.all([
    // 用户资料
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    // 统计数据
    supabase.rpc('get_user_stats', { target_user_id: user.id }),

    // 成就数据 - 使用 RPC 函数获取包含进度的成就列表
    supabase.rpc('get_user_achievements_with_progress', {
      target_user_id: user.id,
    }),
  ]);

  const stats = statsResult.data?.[0] || null;

  return {
    profile: profileResult.data as Profile | null,
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
          total: {
            count: stats.total_smokes,
            cost: Number(stats.total_cost),
          },
        }
      : {
          today: { count: 0, cost: 0 },
          week: { count: 0, cost: 0 },
          month: { count: 0, cost: 0 },
          total: { count: 0, cost: 0 },
        },
    achievements: (achievementsResult.data || []) as AchievementWithStatus[],
  };
}
