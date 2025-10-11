'use client';

import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

/**
 * 更新用户资料（客户端 mutation）
 */
export async function updateProfile(updates: {
  username?: string;
  avatar_url?: string;
  bio?: string;
}): Promise<{ success: boolean; data?: Profile; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('更新用户资料失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 上传用户头像（客户端 mutation）
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

  // 更新用户资料的 avatar_url
  await updateProfile({ avatar_url: publicUrl });

  return { url: publicUrl };
}
