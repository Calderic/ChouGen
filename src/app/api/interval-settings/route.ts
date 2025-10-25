import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api GET /api/interval-settings
 * @description 获取用户的间隔控制设置
 *
 * @returns {Object} response
 * @returns {boolean} response.enabled - 是否启用电子锁
 * @returns {number|null} response.minutes - 间隔时间（分钟）
 *
 * @throws {401} 未登录
 * @throws {500} 服务器错误
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    const { data, error } = await supabase
      .from('profiles')
      .select('smoke_interval_enabled, smoke_interval_minutes')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[API /api/interval-settings GET] 数据库错误:', error);
      throw ApiErrors.internal('获取间隔设置失败');
    }

    return NextResponse.json({
      enabled: data.smoke_interval_enabled,
      minutes: data.smoke_interval_minutes,
    });
  } catch (e) {
    return handleApiError(e, '/api/interval-settings GET');
  }
}

/**
 * @api PUT /api/interval-settings
 * @description 更新用户的间隔控制设置
 *
 * @body {boolean} enabled - 是否启用电子锁
 * @body {number|null} minutes - 间隔时间（分钟，5-1440）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 *
 * @throws {401} 未登录
 * @throws {400} 参数错误
 * @throws {500} 服务器错误
 */
export async function PUT(req: Request) {
  try {
    const { user, supabase } = await requireAuth();
    const { enabled, minutes } = (await req.json()) as {
      enabled: boolean;
      minutes: number | null;
    };

    // 参数验证
    if (typeof enabled !== 'boolean') {
      throw ApiErrors.badRequest('enabled 必须是布尔值');
    }

    // 如果启用，验证间隔时间
    if (enabled) {
      if (minutes === null || typeof minutes !== 'number') {
        throw ApiErrors.badRequest('启用时必须提供间隔时间');
      }
      if (minutes < 5 || minutes > 1440) {
        throw ApiErrors.badRequest('间隔时间必须在 5 到 1440 分钟之间');
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        smoke_interval_enabled: enabled,
        smoke_interval_minutes: enabled ? minutes : null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('[API /api/interval-settings PUT] 数据库错误:', error);
      throw ApiErrors.internal('更新间隔设置失败');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '/api/interval-settings PUT');
  }
}
