'use client';
import type { CigarettePack } from '@/types/database';

/**
 * 创建新的香烟包（客户端 mutation）
 */
export async function createPack(packData: {
  name: string;
  brand?: string;
  total_count: number;
  price: number;
  purchase_date: string;
  photo_url?: string;
}): Promise<{ success: boolean; data?: CigarettePack; error?: string }> {
  try {
    const res = await fetch('/api/packs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packData),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json?.error || '请求失败' };
    return { success: true, data: json.data as CigarettePack };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 更新香烟包信息（客户端 mutation）
 */
export async function updatePack(
  packId: string,
  updates: Partial<
    Pick<
      CigarettePack,
      'name' | 'brand' | 'total_count' | 'remaining_count' | 'price' | 'photo_url'
    >
  >
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/packs/${packId}`, {
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

/**
 * 删除香烟包（客户端 mutation）
 */
export async function deletePack(packId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/packs/${packId}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      return { success: false, error: (json as { error?: string })?.error || '请求失败' };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 上传香烟包照片（客户端 mutation）
 */
export async function uploadPackPhoto(
  packId: string,
  file: File
): Promise<{ url: string | null; error?: string }> {
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/packs/${packId}/photo`, {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    if (!res.ok) return { url: null, error: json?.error || '请求失败' };
    return { url: json.url as string };
  } catch (e: unknown) {
    return { url: null, error: e instanceof Error ? e.message : '网络错误' };
  }
}
