import { createClient } from '@/lib/supabase/client';
import type { Achievement, UserAchievement, AchievementWithStatus } from '@/types/database';

/**
 * 获取所有成就定义
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const res = await fetch('/api/achievements');
    if (!res.ok) return [];
    return (await res.json()) as Achievement[];
  } catch {
    return [];
  }
}

/**
 * 获取用户的成就及解锁状态
 * 使用数据库函数 get_user_achievements_with_progress
 */
export async function getUserAchievements(userId?: string): Promise<AchievementWithStatus[]> {
  try {
    const url = userId
      ? `/api/achievements/user?userId=${encodeURIComponent(userId)}`
      : '/api/achievements/user';
    const res = await fetch(url);
    if (!res.ok) return [];
    return (await res.json()) as AchievementWithStatus[];
  } catch {
    return [];
  }
}

/**
 * 获取用户已解锁的成就
 */
export async function getUserUnlockedAchievements(_userId?: string): Promise<UserAchievement[]> {
  try {
    const res = await fetch('/api/achievements/unlocked');
    if (!res.ok) return [];
    return (await res.json()) as UserAchievement[];
  } catch {
    return [];
  }
}

/**
 * 检查用户是否解锁了指定成就
 */
export async function hasAchievement(achievementId: string, userId?: string): Promise<boolean> {
  try {
    // 复用 user achievements API 避免再加路由
    const achievements = await getUserAchievements(userId);
    return achievements.some(a => a.id === achievementId && a.unlocked);
  } catch {
    return false;
  }
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
