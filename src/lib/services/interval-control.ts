import { createClient } from '@/lib/supabase/client';
import type { LockStatus, IntervalSettings, ViolationLog } from '@/types/database';

/**
 * 获取用户的间隔设置
 */
export async function getIntervalSettings(userId?: string): Promise<IntervalSettings | null> {
  const supabase = createClient();

  // 如果没有传入 userId，获取当前用户
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error('未登录');
      return null;
    }
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('smoke_interval_enabled, smoke_interval_minutes')
    .eq('id', targetUserId)
    .single();

  if (error) {
    console.error('获取间隔设置失败:', error);
    return null;
  }

  return {
    enabled: data.smoke_interval_enabled,
    minutes: data.smoke_interval_minutes,
  };
}

/**
 * 更新间隔设置
 */
export async function updateIntervalSettings(
  enabled: boolean,
  minutes: number | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  // 验证间隔时间范围
  if (enabled && minutes !== null && (minutes < 5 || minutes > 1440)) {
    return { success: false, error: '间隔时间必须在 5 分钟到 24 小时之间' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      smoke_interval_enabled: enabled,
      smoke_interval_minutes: enabled ? minutes : null,
    })
    .eq('id', user.id);

  if (error) {
    console.error('更新间隔设置失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 检查当前的锁定状态
 */
export async function checkLockStatus(userId?: string): Promise<LockStatus | null> {
  const supabase = createClient();

  // 如果没有传入 userId，获取当前用户
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error('未登录');
      return null;
    }
    targetUserId = user.id;
  }

  // 调用数据库函数检查锁定状态
  const { data, error } = await supabase.rpc('check_smoke_lock_status', {
    target_user_id: targetUserId,
  });

  if (error) {
    console.error('检查锁定状态失败:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      is_locked: false,
      last_smoke_time: null,
      unlock_time: null,
      remaining_minutes: 0,
    };
  }

  return {
    is_locked: data[0].is_locked,
    last_smoke_time: data[0].last_smoke_time,
    unlock_time: data[0].unlock_time,
    remaining_minutes: Math.ceil(data[0].remaining_minutes),
  };
}

/**
 * 创建违规记录
 */
export async function createViolationLog(
  smokingRecordId: string,
  expectedUnlockTime: string,
  actualSmokeTime: string,
  intervalMinutes: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  const { error } = await supabase.from('violation_logs').insert({
    user_id: user.id,
    smoking_record_id: smokingRecordId,
    violation_type: 'forced_unlock',
    expected_unlock_time: expectedUnlockTime,
    actual_smoke_time: actualSmokeTime,
    interval_minutes: intervalMinutes,
  });

  if (error) {
    console.error('创建违规记录失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 获取用户的违规记录列表
 */
export async function getViolationLogs(
  userId?: string,
  limit: number = 50
): Promise<ViolationLog[]> {
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
    .from('violation_logs')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取违规记录失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取违规统计摘要
 */
export async function getViolationSummary(userId?: string): Promise<{
  total_count: number;
  last_violation_time: string | null;
}> {
  const supabase = createClient();

  // 如果没有传入 userId，获取当前用户
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error('未登录');
      return { total_count: 0, last_violation_time: null };
    }
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('violation_logs')
    .select('created_at')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取违规统计失败:', error);
    return { total_count: 0, last_violation_time: null };
  }

  return {
    total_count: data?.length || 0,
    last_violation_time: data && data.length > 0 ? data[0].created_at : null,
  };
}

/**
 * 计算解锁时间
 */
export function calculateUnlockTime(lastSmokeTime: string, intervalMinutes: number): Date {
  const lastSmoke = new Date(lastSmokeTime);
  return new Date(lastSmoke.getTime() + intervalMinutes * 60 * 1000);
}
