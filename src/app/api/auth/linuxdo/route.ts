import { NextRequest, NextResponse } from 'next/server';

/**
 * Linux.do OAuth 授权入口
 * GET /api/auth/linuxdo
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get('redirect') || '/';

  // 构建授权 URL
  const authUrl = new URL('https://connect.linux.do/oauth2/authorize');
  authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_LINUXDO_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_LINUXDO_REDIRECT_URI!);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'user');

  // 使用 state 参数传递原始重定向URL（可选，用于 CSRF 保护）
  authUrl.searchParams.set('state', redirectTo);

  return NextResponse.redirect(authUrl.toString());
}
