import { NextResponse } from 'next/server';
import { requireAuth, requireOwnership } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api POST /api/packs/:id/photo
 * @description 上传香烟包照片
 *
 * @param {string} id - 香烟包 ID
 * @body {File} file - 图片文件（multipart/form-data）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 * @returns {string} response.url - 上传后的图片 URL
 *
 * @throws {401} 未登录
 * @throws {400} 缺少文件
 * @throws {403} 无权限访问此香烟包
 * @throws {404} 香烟包不存在
 * @throws {500} 服务器错误
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { user, supabase } = await requireAuth();

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      throw ApiErrors.badRequest('缺少文件');
    }

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

    // 上传文件
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${id}-${Date.now()}.${ext}`;
    const filePath = `packs/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      console.error('[API /api/packs/:id/photo POST] 上传错误:', uploadError);
      throw ApiErrors.internal('上传照片失败');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('public').getPublicUrl(filePath);

    // 更新数据库
    const { error: updateError } = await supabase
      .from('cigarette_packs')
      .update({ photo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('[API /api/packs/:id/photo POST] 更新数据库错误:', updateError);
      throw ApiErrors.internal('更新照片 URL 失败');
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (e) {
    return handleApiError(e, '/api/packs/:id/photo POST');
  }
}
