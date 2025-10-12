import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';

/**
 * @api GET /api/achievements
 * @description 获取所有成就定义列表
 *
 * @returns {Array} response - 成就列表数组
 *
 * @throws {500} 服务器错误
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (error) {
      console.error('[API /api/achievements GET] 数据库错误:', error);
      throw ApiErrors.internal('获取成就列表失败');
    }

    return NextResponse.json(data || []);
  } catch (e) {
    return handleApiError(e, '/api/achievements GET');
  }
}
