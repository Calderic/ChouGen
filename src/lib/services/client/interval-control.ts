'use client';
import type { LockStatus, IntervalSettings, ViolationLog } from '@/types/database';

/**
 * 获取间隔设置（客户端）
 */
export async function getIntervalSettings(): Promise<{
  success: boolean;
  data?: IntervalSettings;
  error?: string;
}> {
  try {
    const res = await fetch('/api/interval-settings');
    const json = await res.json();
    if (!res.ok) return { success: false, error: json?.error || '请求失败' };
    return { success: true, data: json };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 更新间隔设置（客户端）
 */
export async function updateIntervalSettings(
  enabled: boolean,
  minutes: number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/interval-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, minutes }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      return { success: false, error: (json as { error?: string })?.error || '请求失败' };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 检查锁定状态（客户端）
 */
export async function checkLockStatus(): Promise<{
  success: boolean;
  data?: LockStatus;
  error?: string;
}> {
  try {
    const res = await fetch('/api/interval-settings/lock-status');
    const json = await res.json();
    if (!res.ok) return { success: false, error: json?.error || '请求失败' };
    return { success: true, data: json };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 获取违规记录列表（客户端）
 */
export async function getViolations(limit: number = 50): Promise<{
  success: boolean;
  data?: ViolationLog[];
  summary?: { total_count: number; last_violation_time: string | null };
  error?: string;
}> {
  try {
    const res = await fetch(`/api/violations?limit=${limit}`);
    const json = await res.json();
    if (!res.ok) return { success: false, error: json?.error || '请求失败' };
    return { success: true, data: json.data, summary: json.summary };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}
