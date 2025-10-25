import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * @api GET /api/violations
 * @description 获取用户的违规记录列表
 *
 * @query {number} [limit=50] - 返回记录数量限制
 *
 * @returns {Object} response
 * @returns {Array} response.data - 违规记录数组
 * @returns {Object} response.summary - 违规摘要信息
 *
 * @throws {401} 未登录
 * @throws {500} 服务器错误
 */
export async function GET(req: Request) {
  try {
    const { user, supabase } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // 获取违规记录列表
    const { data: violations, error: violationsError } = await supabase
      .from('violation_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (violationsError) {
      console.error('[API /api/violations GET] 数据库错误:', violationsError);
      throw new Error('获取违规记录失败');
    }

    // 获取违规摘要
    const totalCount = violations?.length || 0;
    const lastViolationTime = violations && violations.length > 0 ? violations[0].created_at : null;

    return NextResponse.json({
      data: violations || [],
      summary: {
        total_count: totalCount,
        last_violation_time: lastViolationTime,
      },
    });
  } catch (e) {
    return handleApiError(e, '/api/violations GET');
  }
}
