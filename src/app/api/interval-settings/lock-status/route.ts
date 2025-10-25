import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api GET /api/interval-settings/lock-status
 * @description 检查用户当前的电子锁状态
 *
 * @returns {Object} response
 * @returns {boolean} response.is_locked - 是否处于锁定状态
 * @returns {string|null} response.last_smoke_time - 最后一次抽烟时间
 * @returns {string|null} response.unlock_time - 预计解锁时间
 * @returns {number} response.remaining_minutes - 剩余分钟数
 *
 * @throws {401} 未登录
 * @throws {500} 服务器错误
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    // 调用数据库函数检查锁定状态
    const { data, error } = await supabase.rpc('check_smoke_lock_status', {
      target_user_id: user.id,
    });

    if (error) {
      console.error('[API /api/interval-settings/lock-status GET] 数据库错误:', error);
      throw ApiErrors.internal('检查锁定状态失败');
    }

    // 如果没有返回数据，说明未锁定
    if (!data || data.length === 0) {
      return NextResponse.json({
        is_locked: false,
        last_smoke_time: null,
        unlock_time: null,
        remaining_minutes: 0,
      });
    }

    return NextResponse.json({
      is_locked: data[0].is_locked,
      last_smoke_time: data[0].last_smoke_time,
      unlock_time: data[0].unlock_time,
      remaining_minutes: Math.ceil(data[0].remaining_minutes),
    });
  } catch (e) {
    return handleApiError(e, '/api/interval-settings/lock-status GET');
  }
}
