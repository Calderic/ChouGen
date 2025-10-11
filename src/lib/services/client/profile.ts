'use client';

import type { Profile } from '@/types/database';

// 更新用户资料（通过 Next API）
export async function updateProfile(updates: {
  username?: string;
  avatar_url?: string;
  bio?: string;
}): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      return { success: false, error: (json as { error?: string })?.error || '请求失败' };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

// 更新隐私设置（通过 Next API）
export async function updatePrivacySettings(settings: {
  privacy_show_in_leaderboard: boolean;
  privacy_allow_view_packs: boolean;
  privacy_allow_encouragements: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      return { success: false, error: (json as { error?: string })?.error || '请求失败' };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

// 上传头像（通过 Next API）
export async function uploadAvatar(file: File): Promise<{ url: string | null; error?: string }> {
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) return { url: null, error: json?.error || '请求失败' };
    return { url: json.url as string };
  } catch (e: unknown) {
    return { url: null, error: e instanceof Error ? e.message : '网络错误' };
  }
}
