import { createClient } from '@/lib/supabase/server';
import type { Profile, LeaderboardEntry } from '@/types/database';
import { getChinaTodayStart, getChinaWeekStart, getChinaMonthStart } from '@/lib/utils/timezone';

/**
 * 排行榜页面数据获取（服务端）
 */
export async function getLeaderboardPageData(period: 'day' | 'week' | 'month' | 'all' = 'week') {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 获取排行榜和用户资料
  const [leaderboardResult, profileResult] = await Promise.all([
    supabase.rpc('get_leaderboard', {
      period,
      limit_count: 100,
    }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ]);

  const leaderboard = (leaderboardResult.data || []) as LeaderboardEntry[];

  // 计算当前用户的排名
  const myEntry = leaderboard.find(entry => entry.user_id === user.id);
  let myRanking = null;

  if (myEntry) {
    myRanking = {
      rank: Number(myEntry.rank),
      smoke_count: Number(myEntry.smoke_count),
      total_cost: Number(myEntry.total_cost),
    };
  } else {
    // 用户不在排行榜上，计算该时间段的统计
    let startTime: string;

    switch (period) {
      case 'day':
        startTime = getChinaTodayStart();
        break;
      case 'week':
        startTime = getChinaWeekStart();
        break;
      case 'month':
        startTime = getChinaMonthStart();
        break;
      default:
        startTime = '1970-01-01T00:00:00Z';
    }

    const { data: records } = await supabase
      .from('smoking_records')
      .select('cost')
      .eq('user_id', user.id)
      .gte('smoked_at', startTime);

    const smoke_count = records?.length || 0;
    const total_cost = records?.reduce((sum, r) => sum + Number(r.cost), 0) || 0;

    myRanking = {
      rank: null,
      smoke_count,
      total_cost,
    };
  }

  return {
    leaderboard,
    profile: profileResult.data as Profile | null,
    myRanking,
    period,
  };
}
