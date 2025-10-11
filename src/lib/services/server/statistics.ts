import { createClient } from '@/lib/supabase/server';
import type { Profile, UserStats } from '@/types/database';

/**
 * 统计页面数据获取（服务端）
 */
export async function getStatisticsPageData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 并行获取所有统计数据
  const [statsResult, trendResult, hourlyResult, profileResult] = await Promise.all([
    supabase.rpc('get_user_stats', { target_user_id: user.id }),

    // 获取每日趋势（最近30天）
    supabase
      .from('smoking_records')
      .select('smoked_at, cost')
      .eq('user_id', user.id)
      .gte('smoked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('smoked_at', { ascending: true }),

    // 获取小时分布
    supabase.from('smoking_records').select('smoked_at').eq('user_id', user.id),

    // 获取用户资料
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ]);

  const rawStats = (statsResult.data?.[0] || null) as UserStats | null;

  if (!rawStats) {
    return {
      profile: profileResult.data as Profile | null,
      stats: {
        today: { count: 0, cost: 0, change: 0 },
        week: { count: 0, cost: 0, change: 0 },
        month: { count: 0, cost: 0, change: 0 },
        avgDaily: 0,
      },
      dailyTrend: [],
      hourlyData: [],
      healthData: {
        totalCigarettes: 0,
        totalDays: 0,
        moneySaved: 0,
        moneySpent: 0,
        healthScore: 100,
      },
    };
  }

  // 计算变化百分比（与上一周期比较）
  const now = new Date();

  // 昨天数据
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const { data: yesterdayData } = await supabase
    .from('smoking_records')
    .select('id')
    .eq('user_id', user.id)
    .gte('smoked_at', yesterdayStart.toISOString())
    .lte('smoked_at', yesterdayEnd.toISOString());

  const yesterdayCount = yesterdayData?.length || 0;

  // 上周数据
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const { data: lastWeekData } = await supabase
    .from('smoking_records')
    .select('id')
    .eq('user_id', user.id)
    .gte('smoked_at', lastWeekStart.toISOString())
    .lt('smoked_at', lastWeekEnd.toISOString());

  const lastWeekCount = lastWeekData?.length || 0;

  // 上月数据
  const lastMonthStart = new Date(now);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 2);
  const lastMonthEnd = new Date(now);
  lastMonthEnd.setMonth(lastMonthEnd.getMonth() - 1);

  const { data: lastMonthData } = await supabase
    .from('smoking_records')
    .select('id')
    .eq('user_id', user.id)
    .gte('smoked_at', lastMonthStart.toISOString())
    .lt('smoked_at', lastMonthEnd.toISOString());

  const lastMonthCount = lastMonthData?.length || 0;

  // 计算变化百分比
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // 处理每日趋势数据
  const dailyMap = new Map<string, { smoke_count: number; total_cost: number }>();
  (trendResult.data || []).forEach((record: { smoked_at: string; cost: number }) => {
    const date = new Date(record.smoked_at).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || { smoke_count: 0, total_cost: 0 };
    dailyMap.set(date, {
      smoke_count: existing.smoke_count + 1,
      total_cost: existing.total_cost + Number(record.cost),
    });
  });

  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({
      date,
      ...stats,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 处理小时分布数据
  const hourRangeMap = new Map<string, number>();
  (hourlyResult.data || []).forEach((record: { smoked_at: string }) => {
    const hour = new Date(record.smoked_at).getHours();
    const rangeStart = Math.floor(hour / 2) * 2;
    const rangeEnd = rangeStart + 2;
    const rangeKey = `${rangeStart}-${rangeEnd}`;
    hourRangeMap.set(rangeKey, (hourRangeMap.get(rangeKey) || 0) + 1);
  });

  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const start = i * 2;
    const end = start + 2;
    const key = `${start}-${end}`;
    return {
      hour: key,
      count: hourRangeMap.get(key) || 0,
    };
  });

  // 计算健康数据
  const firstSmokeDate = rawStats.first_smoke_date
    ? new Date(rawStats.first_smoke_date)
    : new Date();
  const totalDays = Math.max(
    1,
    Math.floor((Date.now() - firstSmokeDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const dailyAvg = rawStats.avg_daily_smokes;
  let healthScore = 100;

  if (dailyAvg <= 5) {
    healthScore = 80 - dailyAvg * 2;
  } else if (dailyAvg <= 10) {
    healthScore = 70 - (dailyAvg - 5) * 3;
  } else if (dailyAvg <= 20) {
    healthScore = 55 - (dailyAvg - 10) * 2;
  } else {
    healthScore = Math.max(10, 35 - (dailyAvg - 20));
  }

  return {
    profile: profileResult.data as Profile | null,
    stats: {
      today: {
        count: rawStats.today_smokes,
        cost: Number(rawStats.today_cost),
        change: calculateChange(rawStats.today_smokes, yesterdayCount),
      },
      week: {
        count: rawStats.week_smokes,
        cost: Number(rawStats.week_cost),
        change: calculateChange(rawStats.week_smokes, lastWeekCount),
      },
      month: {
        count: rawStats.month_smokes,
        cost: Number(rawStats.month_cost),
        change: calculateChange(rawStats.month_smokes, lastMonthCount),
      },
      avgDaily: rawStats.avg_daily_smokes,
    },
    dailyTrend,
    hourlyData,
    healthData: {
      totalCigarettes: rawStats.total_smokes,
      totalDays,
      moneySaved: 0,
      moneySpent: Number(rawStats.total_cost),
      healthScore: Math.round(healthScore),
    },
  };
}
