import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api GET /api/achievements/user
 * @description 获取用户的成就解锁情况和进度
 *
 * @query {string} [userId] - 用户 ID（可选，默认当前登录用户）
 *
 * @returns {Array} response - 用户成就列表（包含解锁状态和进度）
 *
 * @throws {500} 服务器错误
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');

    const supabase = await createClient();
    let targetUserId = userIdParam;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // 未登录用户返回空数组，不视为错误
        return NextResponse.json([]);
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase.rpc('get_user_achievements_with_progress', {
      target_user_id: targetUserId,
    });

    if (error) {
      console.error('[API /api/achievements/user GET] RPC 错误:', error);
      throw ApiErrors.internal('获取用户成就失败');
    }

    return NextResponse.json(data || []);
  } catch (e) {
    return handleApiError(e, '/api/achievements/user GET');
  }
}
