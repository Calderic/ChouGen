import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api GET /api/achievements/unlocked
 * @description 获取当前用户已解锁的成就记录
 *
 * @returns {Array} response - 已解锁的成就列表（按解锁时间倒序）
 *
 * @throws {500} 服务器错误
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // 未登录用户返回空数组，不视为错误
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('[API /api/achievements/unlocked GET] 数据库错误:', error);
      throw ApiErrors.internal('获取已解锁成就失败');
    }

    return NextResponse.json(data || []);
  } catch (e) {
    return handleApiError(e, '/api/achievements/unlocked GET');
  }
}
