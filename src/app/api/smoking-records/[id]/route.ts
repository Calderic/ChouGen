import { NextResponse } from 'next/server';
import { requireAuth, requireOwnership } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api DELETE /api/smoking-records/:id
 * @description 删除抽烟记录
 *
 * @param {string} id - 记录 ID
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 *
 * @throws {401} 未登录
 * @throws {403} 无权删除该记录
 * @throws {404} 记录不存在
 * @throws {500} 服务器错误
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Next.js 15: params 是 Promise
    const { user, supabase } = await requireAuth();

    if (!id) {
      throw ApiErrors.badRequest('缺少 id');
    }

    // 先取记录，验证所有权并获取 pack_id
    const { data: record, error: fetchError } = await supabase
      .from('smoking_records')
      .select('id, user_id, pack_id')
      .eq('id', id)
      .single();

    if (fetchError || !record) {
      throw ApiErrors.notFound('记录不存在');
    }

    requireOwnership(record.user_id, user.id, '记录');

    // 删除记录
    const { error: deleteError } = await supabase.from('smoking_records').delete().eq('id', id);

    if (deleteError) {
      console.error('[API /api/smoking-records/:id DELETE] 数据库错误:', deleteError);
      throw ApiErrors.internal('删除记录失败');
    }

    // 回退口粮剩余（如果没有触发器处理删除，这里做补偿）
    const { data: pack, error: packError } = await supabase
      .from('cigarette_packs')
      .select('remaining_count')
      .eq('id', record.pack_id)
      .single();

    if (!packError && pack) {
      await supabase
        .from('cigarette_packs')
        .update({ remaining_count: pack.remaining_count + 1, updated_at: new Date().toISOString() })
        .eq('id', record.pack_id);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '/api/smoking-records/:id DELETE');
  }
}
