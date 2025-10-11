import { NextResponse } from 'next/server';

/**
 * API 错误类
 * 用于在业务逻辑中抛出带状态码的错误
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 统一的 API 错误处理函数
 * 将异常转换为标准的 JSON 响应
 *
 * @param e - 捕获的异常
 * @param context - 可选的上下文信息（用于日志）
 * @returns NextResponse 包含错误信息的响应
 */
export function handleApiError(e: unknown, context?: string): NextResponse {
  if (e instanceof ApiError) {
    // 业务层抛出的已知错误
    const prefix = context ? `[API ${context}]` : '[API]';
    console.error(`${prefix} ${e.message}`);
    return NextResponse.json({ error: e.message }, { status: e.statusCode });
  }

  // 未预期的错误
  const message = e instanceof Error ? e.message : '服务器错误';
  const prefix = context ? `[API ${context}]` : '[API]';
  console.error(`${prefix} 未预期的错误:`, e);
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * 常用错误工厂函数
 */
export const ApiErrors = {
  unauthorized: (msg = '未登录') => new ApiError(msg, 401),
  forbidden: (msg = '无权限访问') => new ApiError(msg, 403),
  notFound: (msg = '资源不存在') => new ApiError(msg, 404),
  badRequest: (msg = '请求参数错误') => new ApiError(msg, 400),
  internal: (msg = '服务器内部错误') => new ApiError(msg, 500),
};
