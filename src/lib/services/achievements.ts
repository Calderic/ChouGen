import { createClient } from '@/lib/supabase/client';
import type { Achievement, UserAchievement, AchievementWithStatus } from '@/types/database';

/**
 * 获取所有成就定义
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('category', { ascending: true })
    .order('requirement_value', { ascending: true });

  if (error) {
    console.error('获取成就列表失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取用户的成就及解锁状态
 * 使用数据库函数 get_user_achievements_with_progress
 */
export async function getUserAchievements(userId?: string): Promise<AchievementWithStatus[]> {
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

  // 调用数据库函数
  const { data, error } = await supabase.rpc('get_user_achievements_with_progress', {
    target_user_id: targetUserId,
  });

  if (error) {
    console.error('获取用户成就失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取用户已解锁的成就
 */
export async function getUserUnlockedAchievements(userId?: string): Promise<UserAchievement[]> {
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
    .from('user_achievements')
    .select('*')
    .eq('user_id', targetUserId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('获取用户已解锁成就失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 检查用户是否解锁了指定成就
 */
export async function hasAchievement(achievementId: string, userId?: string): Promise<boolean> {
  const supabase = createClient();

  // 如果没有传入 userId，获取当前用户
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('achievement_id', achievementId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

/**
 * 订阅用户成就解锁事件
 * 返回清理函数用于取消订阅
 */
export function subscribeToAchievements(
  userId: string,
  onAchievementUnlocked: (achievement: UserAchievement) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('user_achievements_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        onAchievementUnlocked(payload.new as UserAchievement);
      }
    )
    .subscribe();

  // 返回清理函数
  return () => {
    supabase.removeChannel(channel);
  };
}
