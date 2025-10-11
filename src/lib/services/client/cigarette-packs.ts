'use client';

import { createClient } from '@/lib/supabase/client';
import type { CigarettePack } from '@/types/database';

/**
 * 创建新的香烟包（客户端 mutation）
 */
export async function createPack(packData: {
  name: string;
  brand?: string;
  total_count: number;
  price: number;
  purchase_date: string;
  photo_url?: string;
}): Promise<{ success: boolean; data?: CigarettePack; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  const { data, error } = await supabase
    .from('cigarette_packs')
    .insert({
      user_id: user.id,
      name: packData.name,
      brand: packData.brand || null,
      total_count: packData.total_count,
      remaining_count: packData.total_count, // 初始剩余数量等于总数量
      price: packData.price,
      purchase_date: packData.purchase_date,
      photo_url: packData.photo_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('创建香烟包失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 更新香烟包信息（客户端 mutation）
 */
export async function updatePack(
  packId: string,
  updates: Partial<
    Pick<
      CigarettePack,
      'name' | 'brand' | 'total_count' | 'remaining_count' | 'price' | 'photo_url'
    >
  >
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('cigarette_packs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', packId);

  if (error) {
    console.error('更新香烟包失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 删除香烟包（客户端 mutation）
 */
export async function deletePack(packId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from('cigarette_packs').delete().eq('id', packId);

  if (error) {
    console.error('删除香烟包失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 上传香烟包照片（客户端 mutation）
 */
export async function uploadPackPhoto(
  packId: string,
  file: File
): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: '未登录' };
  }

  // 生成唯一文件名
  const fileExt = file.name.split('.').pop();
  const fileName = `${packId}-${Date.now()}.${fileExt}`;
  const filePath = `packs/${fileName}`;

  // 上传文件到 Supabase Storage
  const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    console.error('上传照片失败:', uploadError);
    return { url: null, error: uploadError.message };
  }

  // 获取公开 URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('public').getPublicUrl(filePath);

  // 更新香烟包的 photo_url
  await updatePack(packId, { photo_url: publicUrl });

  return { url: publicUrl };
}
