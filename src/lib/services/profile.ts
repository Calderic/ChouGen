import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

/**
 * 获取当前用户的完整资料
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error) {
    console.error('获取用户资料失败:', error);
    return null;
  }

  return data;
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(
  updates: Partial<Pick<Profile, 'username' | 'avatar_url' | 'bio' | 'status'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('更新用户资料失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 更新隐私设置
 */
export async function updatePrivacySettings(settings: {
  privacy_show_in_leaderboard?: boolean;
  privacy_allow_view_packs?: boolean;
  privacy_allow_encouragements?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('更新隐私设置失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 上传用户头像
 */
export async function uploadAvatar(file: File): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: '未登录' };
  }

  // 生成唯一文件名
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // 上传文件到 Supabase Storage
  const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    console.error('上传头像失败:', uploadError);
    return { url: null, error: uploadError.message };
  }

  // 获取公开 URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('public').getPublicUrl(filePath);

  // 更新用户资料中的头像 URL
  await updateUserProfile({ avatar_url: publicUrl });

  return { url: publicUrl };
}
