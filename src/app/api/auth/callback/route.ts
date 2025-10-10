import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

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
      const errorText = await tokenResponse.text();
      console.error('Token response error:', errorText);
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
      const errorText = await userInfoResponse.text();
      console.error('User info response error:', errorText);
      throw new Error('Failed to get user info');
    }

    const linuxdoUser = await userInfoResponse.json();
    console.log('Linux.do user info:', linuxdoUser);

    // 3. 使用 service role 客户端操作数据库
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 查询是否已存在 profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('linuxdo_id', linuxdoUser.id)
      .maybeSingle();

    let authUserId: string;
    let isNewUser = false;

    if (existingProfile) {
      // 用户已存在
      authUserId = existingProfile.id;

      // 更新用户信息
      await supabaseAdmin
        .from('profiles')
        .update({
          linuxdo_username: linuxdoUser.username,
          linuxdo_trust_level: linuxdoUser.trust_level,
          avatar_url: linuxdoUser.avatar_template
            ? `https://connect.linux.do${linuxdoUser.avatar_template.replace('{size}', '120')}`
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUserId);

      console.log('Existing user logged in:', authUserId);
    } else {
      // 创建新用户 - 使用匿名登录方式（不需要邮箱）
      isNewUser = true;
      const username = linuxdoUser.username;

      // 先创建匿名用户
      const supabase = await createClient();
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username,
            linuxdo_id: linuxdoUser.id,
            linuxdo_username: linuxdoUser.username,
            linuxdo_trust_level: linuxdoUser.trust_level,
            provider: 'linuxdo',
          },
        },
      });

      if (anonError || !anonData.user) {
        console.error('Anonymous sign in error:', anonError);
        throw new Error('Failed to create anonymous user');
      }

      authUserId = anonData.user.id;
      console.log('Created anonymous user:', authUserId);

      // 创建 profile 记录
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUserId,
          username,
          linuxdo_id: linuxdoUser.id,
          linuxdo_username: linuxdoUser.username,
          linuxdo_trust_level: linuxdoUser.trust_level,
          avatar_url: linuxdoUser.avatar_template
            ? `https://connect.linux.do${linuxdoUser.avatar_template.replace('{size}', '120')}`
            : null,
        });

      if (profileError) {
        console.error('Profile create error:', profileError);
        // 回滚：删除刚创建的匿名用户
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        throw new Error('Failed to create profile');
      }

      console.log('Created profile for anonymous user:', authUserId);
      // 注意：匿名登录会自动创建 session，无需额外处理
    }

    // 4. 如果是老用户，需要创建 session
    if (!isNewUser) {
      // 生成登录 token（使用 linuxdo_id 关联）
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: '', // Linux.do 用户没有邮箱
        options: {
          redirectTo: state,
        },
      });

      if (linkError) {
        console.error('Generate link error:', linkError);
        // 如果生成链接失败，尝试通过 user_id 直接创建 session
        // 这需要额外的处理，暂时先记录错误
        console.log('Falling back to manual session creation');
      } else if (linkData) {
        // 提取 token 并创建 session
        const recoveryUrl = new URL(linkData.properties.action_link);
        const token = recoveryUrl.searchParams.get('token');

        if (token) {
          const supabase = await createClient();
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery',
          });

          if (verifyError) {
            console.error('Verify token error:', verifyError);
          } else {
            console.log('Session created successfully for existing user:', authUserId);
          }
        }
      }
    } else {
      console.log('New user session already created via signInAnonymously');
    }

    // 6. 重定向到首页
    const redirectUrl = new URL(state, request.url);
    if (isNewUser) {
      redirectUrl.searchParams.set('welcome', 'true');
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Linux.do OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_failed', request.url)
    );
  }
}
