import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api POST /api/smoking-records
 * @description 创建抽烟记录
 *
 * @body {string} packId - 香烟包 ID（必填）
 * @body {string} [smokedAt] - 抽烟时间 ISO 格式（可选，默认当前时间）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 * @returns {Object} response.data - 创建的抽烟记录对象
 *
 * @throws {401} 未登录
 * @throws {400} 缺少 packId 或香烟包已抽完
 * @throws {404} 香烟包不存在
 * @throws {500} 服务器错误
 */
export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth();
    const { packId, smokedAt } = (await req.json()) as { packId?: string; smokedAt?: string };

    if (!packId) {
      throw ApiErrors.badRequest('缺少 packId');
    }

    // 读包信息用于计算成本与校验库存
    const { data: pack, error: packError } = await supabase
      .from('cigarette_packs')
      .select('price, total_count, remaining_count, name, brand')
      .eq('id', packId)
      .single();

    if (packError || !pack) {
      throw ApiErrors.notFound('香烟包不存在');
    }

    if (pack.remaining_count <= 0) {
      throw ApiErrors.badRequest('香烟包已抽完');
    }

    const costPerCigarette = pack.price / pack.total_count;
    const smokedISO = smokedAt ? new Date(smokedAt).toISOString() : new Date().toISOString();

    const { data, error } = await supabase
      .from('smoking_records')
      .insert({
        user_id: user.id,
        pack_id: packId,
        smoked_at: smokedISO,
        cost: costPerCigarette,
      })
      .select()
      .single();

    if (error) {
      console.error('[API /api/smoking-records POST] 数据库错误:', error);
      throw ApiErrors.internal('创建记录失败');
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return handleApiError(e, '/api/smoking-records POST');
  }
}
