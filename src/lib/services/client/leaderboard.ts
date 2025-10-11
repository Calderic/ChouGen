'use client';

import { createClient } from '@/lib/supabase/client';

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
 * 给用户打气（客户端 mutation）
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
