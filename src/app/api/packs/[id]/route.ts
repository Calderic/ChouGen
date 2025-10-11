import { NextResponse } from 'next/server';
import { requireAuth, requireOwnership } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api PATCH /api/packs/:id
 * @description 更新香烟包信息
 *
 * @param {string} id - 香烟包 ID
 * @body {string} [name] - 名称
 * @body {string} [brand] - 品牌
 * @body {number} [total_count] - 总数量
 * @body {number} [remaining_count] - 剩余数量
 * @body {number} [price] - 价格
 * @body {string} [photo_url] - 照片 URL
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 *
 * @throws {401} 未登录
 * @throws {403} 无权限访问此香烟包
 * @throws {404} 香烟包不存在
 * @throws {500} 服务器错误
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { user, supabase } = await requireAuth();
    const updates = (await req.json()) as Record<string, unknown>;

    // 验证所有权
    const { data: pack, error: fetchError } = await supabase
      .from('cigarette_packs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !pack) {
      throw ApiErrors.notFound('香烟包不存在');
    }

    requireOwnership(pack.user_id, user.id, '香烟包');

    // 更新数据
    const { error } = await supabase
      .from('cigarette_packs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[API /api/packs/:id PATCH] 数据库错误:', error);
      throw ApiErrors.internal('更新香烟包失败');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '/api/packs/:id PATCH');
  }
}

/**
 * @api DELETE /api/packs/:id
 * @description 删除香烟包
 *
 * @param {string} id - 香烟包 ID
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 *
 * @throws {401} 未登录
 * @throws {403} 无权限访问此香烟包
 * @throws {404} 香烟包不存在
 * @throws {500} 服务器错误
 */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { user, supabase } = await requireAuth();

    // 验证所有权
    const { data: pack, error: fetchError } = await supabase
      .from('cigarette_packs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !pack) {
      throw ApiErrors.notFound('香烟包不存在');
    }

    requireOwnership(pack.user_id, user.id, '香烟包');

    // 删除数据
    const { error } = await supabase.from('cigarette_packs').delete().eq('id', id);

    if (error) {
      console.error('[API /api/packs/:id DELETE] 数据库错误:', error);
      throw ApiErrors.internal('删除香烟包失败');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '/api/packs/:id DELETE');
  }
}
