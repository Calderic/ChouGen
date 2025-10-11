import { createClient } from '@/lib/supabase/client';
import type { CigarettePack } from '@/types/database';

/**
 * 获取用户的所有香烟包
 */
export async function getUserPacks(userId?: string): Promise<CigarettePack[]> {
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
    .from('cigarette_packs')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取香烟包列表失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取当前口粮（剩余数量 > 0）
 */
export async function getActivePacks(userId?: string): Promise<CigarettePack[]> {
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
    .from('cigarette_packs')
    .select('*')
    .eq('user_id', targetUserId)
    .gt('remaining_count', 0)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取当前口粮失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取已抽完的香烟包（剩余数量 = 0）
 */
export async function getEmptyPacks(userId?: string): Promise<CigarettePack[]> {
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
    .from('cigarette_packs')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('remaining_count', 0)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('获取已抽完香烟包失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取单个香烟包详情
 */
export async function getPackById(packId: string): Promise<CigarettePack | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cigarette_packs')
    .select('*')
    .eq('id', packId)
    .single();

  if (error) {
    console.error('获取香烟包详情失败:', error);
    return null;
  }

  return data;
}

/**
 * 创建新的香烟包
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
 * 更新香烟包信息
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
 * 删除香烟包
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
 * 减少香烟包剩余数量（抽烟时调用）
 */
export async function decrementPackCount(
  packId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 先获取当前剩余数量
  const { data: pack, error: fetchError } = await supabase
    .from('cigarette_packs')
    .select('remaining_count')
    .eq('id', packId)
    .single();

  if (fetchError || !pack) {
    console.error('获取香烟包失败:', fetchError);
    return { success: false, error: '香烟包不存在' };
  }

  if (pack.remaining_count <= 0) {
    return { success: false, error: '香烟包已抽完' };
  }

  // 减少剩余数量
  const { error: updateError } = await supabase
    .from('cigarette_packs')
    .update({
      remaining_count: pack.remaining_count - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', packId);

  if (updateError) {
    console.error('更新香烟包数量失败:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * 上传香烟包照片
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

/**
 * 获取最近使用的香烟品牌（用于快速添加）
 */
export async function getRecentBrands(limit: number = 10): Promise<string[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('cigarette_packs')
    .select('brand')
    .eq('user_id', user.id)
    .not('brand', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取最近品牌失败:', error);
    return [];
  }

  // 去重
  const brands = [...new Set(data.map(pack => pack.brand).filter(Boolean))] as string[];
  return brands;
}
