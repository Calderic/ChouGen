import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { handleApiError, ApiErrors } from '@/lib/api/error-handler';
import { nowInChina } from '@/lib/utils/timezone';

/**
 * @api POST /api/smoking-records
 * @description 创建抽烟记录
 *
 * @body {string} packId - 香烟包 ID（必填）
 * @body {string} [smokedAt] - 抽烟时间 ISO 格式（可选，默认当前时间）
 * @body {boolean} [forceUnlock] - 是否强制解锁（可选，默认 false）
 *
 * @returns {Object} response
 * @returns {boolean} response.success - 操作是否成功
 * @returns {Object} response.data - 创建的抽烟记录对象
 * @returns {boolean} [response.is_violation] - 是否为违规记录
 *
 * @throws {401} 未登录
 * @throws {400} 缺少 packId 或香烟包已抽完
 * @throws {403} 处于锁定期且未强制解锁
 * @throws {404} 香烟包不存在
 * @throws {500} 服务器错误
 */
export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth();
    const { packId, smokedAt, forceUnlock } = (await req.json()) as {
      packId?: string;
      smokedAt?: string;
      forceUnlock?: boolean;
    };

    if (!packId) {
      throw ApiErrors.badRequest('缺少 packId');
    }

    // 1. 检查用户的间隔设置和锁定状态
    const { data: profile } = await supabase
      .from('profiles')
      .select('smoke_interval_enabled, smoke_interval_minutes')
      .eq('id', user.id)
      .single();

    let isViolation = false;
    let expectedUnlockTime: string | null = null;
    let intervalMinutes = 0;

    // 如果启用了电子锁，检查锁定状态
    if (profile?.smoke_interval_enabled && profile?.smoke_interval_minutes) {
      const { data: lockStatus } = await supabase.rpc('check_smoke_lock_status', {
        target_user_id: user.id,
      });

      const isLocked = lockStatus && lockStatus[0]?.is_locked;

      if (isLocked) {
        if (!forceUnlock) {
          // 未强制解锁，拒绝请求
          throw ApiErrors.forbidden('当前处于电子锁定期，请等待解锁或选择强制解锁');
        }
        // 强制解锁，标记为违规
        isViolation = true;
        expectedUnlockTime = lockStatus[0].unlock_time;
        intervalMinutes = profile.smoke_interval_minutes;
      }
    }

    // 2. 读包信息用于计算成本与校验库存
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
    // 使用中国时区的当前时间
    const smokedISO = smokedAt ? new Date(smokedAt).toISOString() : nowInChina().toISOString();

    // 3. 创建抽烟记录
    const { data, error } = await supabase
      .from('smoking_records')
      .insert({
        user_id: user.id,
        pack_id: packId,
        smoked_at: smokedISO,
        cost: costPerCigarette,
        is_violation: isViolation,
        violation_type: isViolation ? 'forced_unlock' : null,
      })
      .select()
      .single();

    if (error) {
      console.error('[API /api/smoking-records POST] 数据库错误:', error);
      throw ApiErrors.internal('创建记录失败');
    }

    // 4. 如果是违规记录，创建违规日志
    if (isViolation && expectedUnlockTime) {
      await supabase.from('violation_logs').insert({
        user_id: user.id,
        smoking_record_id: data.id,
        violation_type: 'forced_unlock',
        expected_unlock_time: expectedUnlockTime,
        actual_smoke_time: smokedISO,
        interval_minutes: intervalMinutes,
      });
    }

    return NextResponse.json({
      success: true,
      data,
      is_violation: isViolation,
    });
  } catch (e) {
    return handleApiError(e, '/api/smoking-records POST');
  }
}
