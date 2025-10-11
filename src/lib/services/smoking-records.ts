import { createClient } from '@/lib/supabase/client';
import type { SmokingRecord } from '@/types/database';

/**
 * 扩展的抽烟记录类型（包含香烟包信息）
 */
export interface SmokingRecordWithPack extends SmokingRecord {
  pack: {
    name: string;
    brand: string | null;
  };
}

/**
 * 获取用户的抽烟记录
 */
export async function getSmokingRecords(
  userId?: string,
  limit: number = 50
): Promise<SmokingRecordWithPack[]> {
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
    .from('smoking_records')
    .select(
      `
      *,
      pack:cigarette_packs!smoking_records_pack_id_fkey (
        name,
        brand
      )
    `
    )
    .eq('user_id', targetUserId)
    .order('smoked_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取抽烟记录失败:', error);
    return [];
  }

  return (data as SmokingRecordWithPack[]) || [];
}

/**
 * 获取今天的抽烟记录
 */
export async function getTodayRecords(userId?: string): Promise<SmokingRecordWithPack[]> {
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

  // 获取今天的开始时间（00:00:00）
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('smoking_records')
    .select(
      `
      *,
      pack:cigarette_packs!smoking_records_pack_id_fkey (
        name,
        brand
      )
    `
    )
    .eq('user_id', targetUserId)
    .gte('smoked_at', today.toISOString())
    .order('smoked_at', { ascending: false });

  if (error) {
    console.error('获取今日记录失败:', error);
    return [];
  }

  return (data as SmokingRecordWithPack[]) || [];
}

/**
 * 创建抽烟记录
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
  // 注意：数据库触发器 decrease_pack_count() 会自动减少香烟包数量，无需手动调用
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
 * 删除抽烟记录
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

/**
 * 获取用户统计数据（今日、本周、本月）
 */
export async function getUserStats(userId?: string): Promise<{
  today: { count: number; cost: number };
  week: { count: number; cost: number };
  month: { count: number; cost: number };
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
      return {
        today: { count: 0, cost: 0 },
        week: { count: 0, cost: 0 },
        month: { count: 0, cost: 0 },
      };
    }
    targetUserId = user.id;
  }

  // 计算时间范围
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const monthStart = new Date(now);
  monthStart.setMonth(now.getMonth() - 1);

  // 获取所有记录
  const { data, error } = await supabase
    .from('smoking_records')
    .select('smoked_at, cost')
    .eq('user_id', targetUserId)
    .gte('smoked_at', monthStart.toISOString());

  if (error) {
    console.error('获取统计数据失败:', error);
    return {
      today: { count: 0, cost: 0 },
      week: { count: 0, cost: 0 },
      month: { count: 0, cost: 0 },
    };
  }

  const records = data || [];

  // 计算统计数据
  const todayRecords = records.filter(r => new Date(r.smoked_at) >= todayStart);
  const weekRecords = records.filter(r => new Date(r.smoked_at) >= weekStart);
  const monthRecords = records;

  return {
    today: {
      count: todayRecords.length,
      cost: todayRecords.reduce((sum, r) => sum + r.cost, 0),
    },
    week: {
      count: weekRecords.length,
      cost: weekRecords.reduce((sum, r) => sum + r.cost, 0),
    },
    month: {
      count: monthRecords.length,
      cost: monthRecords.reduce((sum, r) => sum + r.cost, 0),
    },
  };
}

/**
 * 获取某个香烟包的所有抽烟记录
 */
export async function getPackRecords(packId: string): Promise<SmokingRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('smoking_records')
    .select('*')
    .eq('pack_id', packId)
    .order('smoked_at', { ascending: false });

  if (error) {
    console.error('获取香烟包记录失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 订阅抽烟记录变化（Realtime）
 */
export function subscribeToRecords(
  userId: string,
  onRecordAdded: (record: SmokingRecord) => void,
  onRecordDeleted: (recordId: string) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('smoking_records_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'smoking_records',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        onRecordAdded(payload.new as SmokingRecord);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'smoking_records',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        onRecordDeleted((payload.old as SmokingRecord).id);
      }
    )
    .subscribe();

  // 返回清理函数
  return () => {
    supabase.removeChannel(channel);
  };
}
