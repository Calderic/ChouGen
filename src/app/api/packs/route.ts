import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api POST /api/packs
 * @description 创建新的香烟包
 *
 * @body {string} name - 香烟包名称（必填）
 * @body {string} [brand] - 品牌（可选）
 * @body {number} total_count - 总数量（必填）
 * @body {number} price - 价格（必填）
 * @body {string} purchase_date - 购买日期 ISO 格式（必填）
 * @body {string} [photo_url] - 照片 URL（可选）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 * @returns {Object} response.data - 创建的香烟包对象
 *
 * @throws {401} 未登录
 * @throws {400} 缺少必填参数
 * @throws {500} 服务器错误
 */
export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth();

    const body = (await req.json()) as {
      name: string;
      brand?: string;
      total_count: number;
      price: number;
      purchase_date: string;
      photo_url?: string;
    };

    // 参数验证
    if (!body.name || !body.total_count || !body.price || !body.purchase_date) {
      throw ApiErrors.badRequest('缺少必填参数');
    }

    const { data, error } = await supabase
      .from('cigarette_packs')
      .insert({
        user_id: user.id,
        name: body.name,
        brand: body.brand || null,
        total_count: body.total_count,
        remaining_count: body.total_count,
        price: body.price,
        purchase_date: body.purchase_date,
        photo_url: body.photo_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[API /api/packs POST] 数据库错误:', error);
      throw ApiErrors.internal('创建香烟包失败');
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return handleApiError(e, '/api/packs POST');
  }
}
