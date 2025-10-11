'use client';

import { createClient } from '@/lib/supabase/client';
import type { SmokingRecord } from '@/types/database';

/**
 * 创建抽烟记录（客户端 mutation）
 */
export async function createSmokingRecord(
  packId: string,
  smokedAt?: Date
): Promise<{ success: boolean; data?: SmokingRecord; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  // 获取香烟包信息以计算成本
  const { data: pack, error: packError } = await supabase
    .from('cigarette_packs')
    .select('price, total_count, remaining_count')
    .eq('id', packId)
    .single();

  if (packError || !pack) {
    console.error('获取香烟包信息失败:', packError);
    return { success: false, error: '香烟包不存在' };
  }

  if (pack.remaining_count <= 0) {
    return { success: false, error: '香烟包已抽完' };
  }

  // 计算单支成本 = 总价 / 总支数
  const costPerCigarette = pack.price / pack.total_count;

  // 创建抽烟记录
  const { data, error } = await supabase
    .from('smoking_records')
    .insert({
      user_id: user.id,
      pack_id: packId,
      smoked_at: (smokedAt || new Date()).toISOString(),
      cost: costPerCigarette,
    })
    .select()
    .single();

  if (error) {
    console.error('创建抽烟记录失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 删除抽烟记录（客户端 mutation）
 */
export async function deleteSmokingRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 先获取记录信息（用于恢复香烟包数量）
  const { data: record, error: fetchError } = await supabase
    .from('smoking_records')
    .select('pack_id')
    .eq('id', recordId)
    .single();

  if (fetchError || !record) {
    console.error('获取记录失败:', fetchError);
    return { success: false, error: '记录不存在' };
  }

  // 删除记录
  const { error: deleteError } = await supabase.from('smoking_records').delete().eq('id', recordId);

  if (deleteError) {
    console.error('删除记录失败:', deleteError);
    return { success: false, error: deleteError.message };
  }

  // 恢复香烟包数量（增加 1）
  const { data: pack, error: packError } = await supabase
    .from('cigarette_packs')
    .select('remaining_count')
    .eq('id', record.pack_id)
    .single();

  if (!packError && pack) {
    await supabase
      .from('cigarette_packs')
      .update({
        remaining_count: pack.remaining_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.pack_id);
  }

  return { success: true };
}
