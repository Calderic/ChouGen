import { createClient } from '@/lib/supabase/client';
import type { UserStats } from '@/types/database';

/**
 * 获取用户统计数据
 */
export async function getUserStatistics(userId?: string): Promise<UserStats | null> {
  const supabase = createClient();

  let targetUserId = userId;

  // 如果没有提供 userId，获取当前用户
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    targetUserId = user.id;
  }

  // 调用数据库函数获取统计数据
  const { data, error } = await supabase.rpc('get_user_stats', {
    target_user_id: targetUserId,
  });

  if (error) {
    console.error('获取统计数据失败:', error);
    return null;
  }

  // 数据库函数返回的是数组，取第一条
  return data?.[0] || null;
}

/**
 * 获取用户品牌统计
 */
export async function getBrandStatistics(userId?: string): Promise<
  Array<{
    brand: string;
    pack_name: string;
    smoke_count: number;
    total_cost: number;
    last_smoked_at: string;
  }>
> {
  const supabase = createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    targetUserId = user.id;
  }

  const { data, error } = await supabase.rpc('get_brand_stats', {
    target_user_id: targetUserId,
  });

  if (error) {
    console.error('获取品牌统计失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取用户每日统计趋势(最近 30 天)
 */
export async function getDailyTrend(userId?: string): Promise<
  Array<{
    date: string;
    smoke_count: number;
    total_cost: number;
  }>
> {
  const supabase = createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    targetUserId = user.id;
  }

  // 获取最近 30 天的每日数据
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('smoking_records')
    .select('smoked_at, cost')
    .eq('user_id', targetUserId)
    .gte('smoked_at', thirtyDaysAgo.toISOString())
    .order('smoked_at', { ascending: true });

  if (error) {
    console.error('获取每日趋势失败:', error);
    return [];
  }

  // 按日期分组统计
  const dailyMap = new Map<string, { smoke_count: number; total_cost: number }>();

  data.forEach(record => {
    const date = new Date(record.smoked_at).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || { smoke_count: 0, total_cost: 0 };
    dailyMap.set(date, {
      smoke_count: existing.smoke_count + 1,
      total_cost: existing.total_cost + Number(record.cost),
    });
  });

  // 转换为数组
  return Array.from(dailyMap.entries())
    .map(([date, stats]) => ({
      date,
      ...stats,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 获取小时分布统计（按 2 小时分组）
 */
export async function getHourlyDistribution(userId?: string): Promise<
  Array<{
    hour: string;
    count: number;
  }>
> {
  const supabase = createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('smoking_records')
    .select('smoked_at')
    .eq('user_id', targetUserId);

  if (error) {
    console.error('获取小时分布失败:', error);
    return [];
  }

  // 按 2 小时分组统计
  const hourRangeMap = new Map<string, number>();

  data.forEach(record => {
    const hour = new Date(record.smoked_at).getHours();
    const rangeStart = Math.floor(hour / 2) * 2;
    const rangeEnd = rangeStart + 2;
    const rangeKey = `${rangeStart}-${rangeEnd}`;
    hourRangeMap.set(rangeKey, (hourRangeMap.get(rangeKey) || 0) + 1);
  });

  // 补全所有时段 (0-2, 2-4, ..., 22-24)
  const result = Array.from({ length: 12 }, (_, i) => {
    const start = i * 2;
    const end = start + 2;
    const key = `${start}-${end}`;
    return {
      hour: key,
      count: hourRangeMap.get(key) || 0,
    };
  });

  return result;
}

/**
 * 获取统计概览数据（用于 StatsOverview 组件）
 */
export async function getStatsOverview(userId?: string): Promise<{
  today: { count: number; cost: number; change: number };
  week: { count: number; cost: number; change: number };
  month: { count: number; cost: number; change: number };
  avgDaily: number;
} | null> {
  const supabase = createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    targetUserId = user.id;
  }

  // 获取基础统计数据
  const stats = await getUserStatistics(targetUserId);

  if (!stats) {
    return null;
  }

  // 计算对比数据（与上一周期比较）
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
    .eq('user_id', targetUserId)
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
    .eq('user_id', targetUserId)
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
    .eq('user_id', targetUserId)
    .gte('smoked_at', lastMonthStart.toISOString())
    .lt('smoked_at', lastMonthEnd.toISOString());

  const lastMonthCount = lastMonthData?.length || 0;

  // 计算变化百分比
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    today: {
      count: stats.today_smokes,
      cost: Number(stats.today_cost),
      change: calculateChange(stats.today_smokes, yesterdayCount),
    },
    week: {
      count: stats.week_smokes,
      cost: Number(stats.week_cost),
      change: calculateChange(stats.week_smokes, lastWeekCount),
    },
    month: {
      count: stats.month_smokes,
      cost: Number(stats.month_cost),
      change: calculateChange(stats.month_smokes, lastMonthCount),
    },
    avgDaily: stats.avg_daily_smokes,
  };
}

/**
 * 获取健康影响数据
 */
export async function getHealthImpact(userId?: string): Promise<{
  totalCigarettes: number;
  totalDays: number;
  moneySaved: number;
  moneySpent: number;
  healthScore: number;
} | null> {
  const supabase = createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    targetUserId = user.id;
  }

  const stats = await getUserStatistics(targetUserId);

  if (!stats) {
    return null;
  }

  // 计算使用天数
  const firstSmokeDate = stats.first_smoke_date ? new Date(stats.first_smoke_date) : new Date();
  const totalDays = Math.max(
    1,
    Math.floor((Date.now() - firstSmokeDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  // 计算健康分数 (100分制)
  // 基础分 100，每天抽烟会减分
  const dailyAvg = stats.avg_daily_smokes;
  let healthScore = 100;

  if (dailyAvg <= 5) {
    healthScore = 80 - dailyAvg * 2; // 5支以下: 70-80分
  } else if (dailyAvg <= 10) {
    healthScore = 70 - (dailyAvg - 5) * 3; // 5-10支: 55-70分
  } else if (dailyAvg <= 20) {
    healthScore = 55 - (dailyAvg - 10) * 2; // 10-20支: 35-55分
  } else {
    healthScore = Math.max(10, 35 - (dailyAvg - 20)); // 20支以上: 10-35分
  }

  return {
    totalCigarettes: stats.total_smokes,
    totalDays,
    moneySaved: 0, // 还在抽烟，没有省钱
    moneySpent: Number(stats.total_cost),
    healthScore: Math.round(healthScore),
  };
}
