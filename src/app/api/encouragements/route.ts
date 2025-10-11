import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api POST /api/encouragements
 * @description 给其他用户发送打气消息
 *
 * @body {string} toUserId - 接收者用户 ID（必填）
 * @body {string} message - 打气消息内容（必填）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 *
 * @throws {401} 未登录
 * @throws {400} 参数不完整、不能给自己打气、或对方不允许接收打气
 * @throws {404} 用户不存在
 * @throws {500} 服务器错误
 */
export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth();
    const { toUserId, message } = (await req.json()) as { toUserId?: string; message?: string };

    if (!toUserId || !message) {
      throw ApiErrors.badRequest('参数不完整');
    }

    if (user.id === toUserId) {
      throw ApiErrors.badRequest('不能给自己打气');
    }

    // 检查目标用户隐私设置
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('privacy_allow_encouragements')
      .eq('id', toUserId)
      .single();

    if (profileError || !targetProfile) {
      throw ApiErrors.notFound('用户不存在');
    }

    if (!targetProfile.privacy_allow_encouragements) {
      throw ApiErrors.badRequest('该用户不允许接收打气');
    }

    // 插入打气记录
    const { error } = await supabase.from('encouragements').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      message,
    });

    if (error) {
      console.error('[API /api/encouragements POST] 数据库错误:', error);
      throw ApiErrors.internal('发送打气失败');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '/api/encouragements POST');
  }
}
