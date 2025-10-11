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
 * 获取小时分布统计
 */
export async function getHourlyDistribution(userId?: string): Promise<
  Array<{
    hour: number;
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

  // 按小时分组统计
  const hourMap = new Map<number, number>();

  data.forEach(record => {
    const hour = new Date(record.smoked_at).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  // 补全所有小时(0-23)
  const result = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourMap.get(hour) || 0,
  }));

  return result;
}
