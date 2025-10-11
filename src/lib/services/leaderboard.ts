import { createClient } from '@/lib/supabase/client';
import type { LeaderboardEntry } from '@/types/database';

/**
 * 时间周期类型
 */
export type LeaderboardPeriod = 'day' | 'week' | 'month' | 'all';

/**
 * 获取排行榜数据
 * 使用数据库函数 get_leaderboard，自动尊重用户隐私设置
 */
export async function getLeaderboard(
  period: LeaderboardPeriod = 'week',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_leaderboard', {
    period,
    limit_count: limit,
  });

  if (error) {
    console.error('获取排行榜失败:', error);
    return [];
  }

  return (data as LeaderboardEntry[]) || [];
}

/**
 * 获取当前用户的排名信息
 */
export async function getMyRanking(period: LeaderboardPeriod = 'week'): Promise<{
  rank: number | null;
  smoke_count: number;
  total_cost: number;
} | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('未登录');
    return null;
  }

  // 获取完整排行榜
  const leaderboard = await getLeaderboard(period, 1000);

  // 查找当前用户
  const myEntry = leaderboard.find(entry => entry.user_id === user.id);

  if (myEntry) {
    // 用户在排行榜上
    return {
      rank: Number(myEntry.rank),
      smoke_count: Number(myEntry.smoke_count),
      total_cost: Number(myEntry.total_cost),
    };
  }

  // 用户不在排行榜上，手动计算该时间段的统计
  // 计算时间范围
  let startTime: string;
  const now = new Date();

  switch (period) {
    case 'day': {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      startTime = dayStart.toISOString();
      break;
    }
    case 'week': {
      const weekStart = new Date(now);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 周一
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      startTime = weekStart.toISOString();
      break;
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startTime = monthStart.toISOString();
      break;
    }
    default:
      startTime = '1970-01-01T00:00:00Z';
  }

  // 查询该时间段的记录
  const { data: records, error } = await supabase
    .from('smoking_records')
    .select('cost')
    .eq('user_id', user.id)
    .gte('smoked_at', startTime);

  if (error) {
    console.error('获取用户记录失败:', error);
    return {
      rank: null,
      smoke_count: 0,
      total_cost: 0,
    };
  }

  const smoke_count = records?.length || 0;
  const total_cost = records?.reduce((sum, r) => sum + Number(r.cost), 0) || 0;

  return {
    rank: null, // 未上榜，rank 为 null
    smoke_count,
    total_cost,
  };
}

/**
 * 扩展的用户详情（用于排行榜点击查看）
 */
export interface UserDetail {
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  status: string;
  today_smokes: number;
  last_smoke_time: string | null;
  last_cigarette: string | null;
  privacy_allow_encouragements: boolean;
}

/**
 * 获取用户详情（用于排行榜点击查看）
 */
export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const supabase = createClient();

  // 获取用户资料
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url, bio, status, privacy_allow_encouragements')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('获取用户资料失败:', profileError);
    return null;
  }

  // 获取今日抽烟数量
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayRecords, error: todayError } = await supabase
    .from('smoking_records')
    .select('id')
    .eq('user_id', userId)
    .gte('smoked_at', today.toISOString());

  const todaySmokes = todayError ? 0 : todayRecords?.length || 0;

  // 获取最后一次抽烟记录
  const { data: lastRecord, error: lastError } = await supabase
    .from('smoking_records')
    .select(
      `
      smoked_at,
      pack:cigarette_packs!smoking_records_pack_id_fkey (
        name
      )
    `
    )
    .eq('user_id', userId)
    .order('smoked_at', { ascending: false })
    .limit(1)
    .single();

  const lastSmokeTime = lastError || !lastRecord ? null : lastRecord.smoked_at;
  const lastCigarette =
    lastError || !lastRecord || !lastRecord.pack || Array.isArray(lastRecord.pack)
      ? null
      : (lastRecord.pack as { name: string }).name;

  return {
    user_id: userId,
    username: profile.username,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    status: profile.status,
    today_smokes: todaySmokes,
    last_smoke_time: lastSmokeTime,
    last_cigarette: lastCigarette,
    privacy_allow_encouragements: profile.privacy_allow_encouragements,
  };
}

/**
 * 给用户打气（发送鼓励消息）
 */
export async function sendEncouragement(
  toUserId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  if (user.id === toUserId) {
    return { success: false, error: '不能给自己打气' };
  }

  // 检查目标用户是否允许接收打气
  const { data: targetProfile, error: profileError } = await supabase
    .from('profiles')
    .select('privacy_allow_encouragements')
    .eq('id', toUserId)
    .single();

  if (profileError || !targetProfile) {
    return { success: false, error: '用户不存在' };
  }

  if (!targetProfile.privacy_allow_encouragements) {
    return { success: false, error: '该用户不允许接收打气' };
  }

  // 创建打气记录
  const { error } = await supabase.from('encouragements').insert({
    from_user_id: user.id,
    to_user_id: toUserId,
    message,
  });

  if (error) {
    console.error('发送打气失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 获取收到的打气记录
 */
export async function getReceivedEncouragements(
  userId?: string,
  limit: number = 50
): Promise<
  Array<{
    id: string;
    message: string;
    created_at: string;
    from_user: {
      username: string;
      avatar_url: string | null;
    };
  }>
> {
  const supabase = createClient();

  // 如果没有传入 userId，获取当前用户
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error('未登录');
      return [];
    }
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('encouragements')
    .select(
      `
      id,
      message,
      created_at,
      from_user:profiles!encouragements_from_user_id_fkey (
        username,
        avatar_url
      )
    `
    )
    .eq('to_user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取打气记录失败:', error);
    return [];
  }

  return (
    (data as unknown as Array<{
      id: string;
      message: string;
      created_at: string;
      from_user: {
        username: string;
        avatar_url: string | null;
      };
    }>) || []
  );
}
