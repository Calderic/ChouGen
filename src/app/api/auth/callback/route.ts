import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Linux.do OAuth 回调处理
 * GET /api/auth/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
  }

  try {
    // 1. 使用 code 换取 access_token
    const tokenResponse = await fetch('https://connect.linux.do/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_LINUXDO_CLIENT_ID!,
        client_secret: process.env.LINUXDO_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.NEXT_PUBLIC_LINUXDO_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 使用 access_token 获取用户信息
    const userInfoResponse = await fetch('https://connect.linux.do/oauth2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const linuxdoUser = await userInfoResponse.json();

    // 3. 查询或创建本地用户
    const supabase = await createClient();

    // 先查询是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('linuxdo_id', linuxdoUser.id)
      .single();

    let userId: string;

    if (existingUser) {
      // 用户已存在，更新信息
      userId = existingUser.id;
      await supabase
        .from('users')
        .update({
          linuxdo_username: linuxdoUser.username,
          linuxdo_trust_level: linuxdoUser.trust_level,
          avatar_url: linuxdoUser.avatar_template
            ? `https://connect.linux.do${linuxdoUser.avatar_template.replace('{size}', '120')}`
            : null,
        })
        .eq('id', userId);
    } else {
      // 创建新用户
      // 生成唯一的 username（使用 linuxdo_username）
      const username = `${linuxdoUser.username}_${Date.now()}`;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          linuxdo_id: linuxdoUser.id,
          linuxdo_username: linuxdoUser.username,
          linuxdo_trust_level: linuxdoUser.trust_level,
          avatar_url: linuxdoUser.avatar_template
            ? `https://connect.linux.do${linuxdoUser.avatar_template.replace('{size}', '120')}`
            : null,
        })
        .select()
        .single();

      if (createError || !newUser) {
        throw new Error('Failed to create user');
      }

      userId = newUser.id;
    }

    // 4. 创建 Supabase Auth session
    // 注意：这里需要使用 service role 来创建自定义 session
    // 简化方案：使用 Supabase 的 signInAnonymously 然后关联用户
    // 更好的方案是使用自定义 JWT

    // TODO: 实现自定义 JWT session
    // 目前先重定向到首页，前端可以根据 URL 参数识别登录成功
    const redirectUrl = new URL(state, request.url);
    redirectUrl.searchParams.set('linuxdo_login', 'success');
    redirectUrl.searchParams.set('user_id', userId);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Linux.do OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_failed', request.url)
    );
  }
}
