'use client';

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
 * 获取用户详情（客户端）
 */
export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  try {
    const res = await fetch(`/api/leaderboard/user/${userId}`);
    if (!res.ok) return null;
    return (await res.json()) as UserDetail;
  } catch {
    return null;
  }
}

/**
 * 给用户打气（客户端 mutation）
 */
export async function sendEncouragement(
  toUserId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/encouragements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId, message }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json?.error || '请求失败' };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}
