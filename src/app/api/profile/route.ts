import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api PATCH /api/profile
 * @description 更新当前用户的基本资料或隐私设置
 *
 * @body {string} [username] - 用户名
 * @body {string} [avatar_url] - 头像 URL
 * @body {string} [bio] - 个人简介
 * @body {boolean} [privacy_show_in_leaderboard] - 是否在排行榜中显示
 * @body {boolean} [privacy_allow_view_packs] - 是否允许查看口粮
 * @body {boolean} [privacy_allow_encouragements] - 是否允许接收打气
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 *
 * @throws {401} 未登录
 * @throws {500} 服务器错误
 */
export async function PATCH(req: Request) {
  try {
    const { user, supabase } = await requireAuth();
    const updates = (await req.json()) as Record<string, unknown>;

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('[API /api/profile PATCH] 数据库错误:', error);
      throw ApiErrors.internal('更新资料失败');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '/api/profile PATCH');
  }
}
