import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';
import { getChinaTodayStart } from '@/lib/utils/timezone';

/**
 * @api GET /api/leaderboard/user/:id
 * @description 获取用户详细信息（用于排行榜点击查看）
 *
 * @param {string} id - 用户 ID
 *
 * @returns {Object} response - 用户详情对象
 * @returns {string} response.user_id - 用户 ID
 * @returns {string} response.username - 用户名
 * @returns {string|null} response.avatar_url - 头像 URL
 * @returns {string|null} response.bio - 个人简介
 * @returns {string} response.status - 用户状态
 * @returns {number} response.today_smokes - 今日抽烟数量
 * @returns {string|null} response.last_smoke_time - 最后抽烟时间
 * @returns {string|null} response.last_cigarette - 最后抽的香烟名称
 * @returns {boolean} response.privacy_allow_encouragements - 是否允许接收打气
 *
 * @throws {404} 用户不存在
 * @throws {500} 服务器错误
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await ctx.params;
    const supabase = await createClient();

    // 用户资料
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio, status, privacy_allow_encouragements')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw ApiErrors.notFound('用户不存在');
    }

    // 今日数量
    const { data: todayRecords } = await supabase
      .from('smoking_records')
      .select('id')
      .eq('user_id', userId)
      .gte('smoked_at', getChinaTodayStart());

    const todaySmokes = todayRecords?.length || 0;

    // 最后一条记录
    const { data: lastRecord } = await supabase
      .from('smoking_records')
      .select(
        `
        smoked_at,
        pack:cigarette_packs!smoking_records_pack_id_fkey (name)
      `
      )
      .eq('user_id', userId)
      .order('smoked_at', { ascending: false })
      .limit(1)
      .single();

    const lastSmokeTime = lastRecord?.smoked_at ?? null;
    const lastCigarette =
      lastRecord?.pack && !Array.isArray(lastRecord.pack)
        ? (lastRecord.pack as { name: string }).name
        : null;

    return NextResponse.json({
      user_id: userId,
      username: profile.username,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      status: profile.status,
      today_smokes: todaySmokes,
      last_smoke_time: lastSmokeTime,
      last_cigarette: lastCigarette,
      privacy_allow_encouragements: profile.privacy_allow_encouragements,
    });
  } catch (e) {
    return handleApiError(e, '/api/leaderboard/user/:id GET');
  }
}
