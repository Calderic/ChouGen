import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { ApiErrors } from './error-handler';

/**
 * 认证上下文
 * 包含已验证的用户和 Supabase 客户端实例
 */
export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
}

/**
 * 要求用户已登录
 * 如果未登录则抛出 401 错误
 *
 * @returns 认证上下文，包含用户信息和 Supabase 客户端
 * @throws {ApiError} 401 未登录
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   const { user, supabase } = await requireAuth();
 *   // 此处 user 和 supabase 已验证可用
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('[Auth] 获取用户失败:', error);
    throw ApiErrors.unauthorized('认证失败');
  }

  if (!user) {
    throw ApiErrors.unauthorized('未登录');
  }

  return { user, supabase };
}

/**
 * 验证资源所有权
 * 检查当前用户是否拥有指定的资源
 *
 * @param userId - 资源所有者的用户 ID
 * @param currentUserId - 当前登录用户的 ID
 * @param resourceName - 资源名称（用于错误提示）
 * @throws {ApiError} 403 无权限访问
 *
 * @example
 * ```typescript
 * const { user } = await requireAuth();
 * await requireOwnership(pack.user_id, user.id, '香烟包');
 * ```
 */
export function requireOwnership(
  userId: string,
  currentUserId: string,
  resourceName = '资源'
): void {
  if (userId !== currentUserId) {
    throw ApiErrors.forbidden(`无权访问此${resourceName}`);
  }
}
