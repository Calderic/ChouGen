'use client';

import type { SmokingRecord } from '@/types/database';

// 通过 Next 服务端 API 转发，避免在客户端直连 Supabase
export async function createSmokingRecord(
  packId: string,
  smokedAt?: Date
): Promise<{ success: boolean; data?: SmokingRecord; error?: string }> {
  try {
    const res = await fetch('/api/smoking-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId, smokedAt: smokedAt ? smokedAt.toISOString() : undefined }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json?.error || '请求失败' };
    }
    return { success: true, data: json.data as SmokingRecord };
  } catch (e) {
    const error = e instanceof Error ? e.message : '网络错误';
    return { success: false, error };
  }
}

export async function deleteSmokingRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/smoking-records/${recordId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json?.error || '请求失败' };
    }
    return { success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : '网络错误';
    return { success: false, error };
  }
}
