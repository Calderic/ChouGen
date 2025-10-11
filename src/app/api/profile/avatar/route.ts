import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api POST /api/profile/avatar
 * @description 上传当前用户的头像
 *
 * @body {File} file - 图片文件（multipart/form-data）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 * @returns {string} response.url - 上传后的头像 URL
 *
 * @throws {401} 未登录
 * @throws {400} 缺少文件
 * @throws {500} 服务器错误
 */
export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth();

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      throw ApiErrors.badRequest('缺少文件');
    }

    // 上传文件
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      console.error('[API /api/profile/avatar POST] 上传错误:', uploadError);
      throw ApiErrors.internal('上传头像失败');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('public').getPublicUrl(filePath);

    // 更新数据库
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('[API /api/profile/avatar POST] 更新数据库错误:', updateError);
      throw ApiErrors.internal('更新头像 URL 失败');
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (e) {
    return handleApiError(e, '/api/profile/avatar POST');
  }
}
