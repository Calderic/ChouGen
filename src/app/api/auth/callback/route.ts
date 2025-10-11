import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

function isTokenResponse(x: unknown): x is TokenResponse {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o['access_token'] === 'string';
}

type LinuxdoUser = {
  id: string | number;
  username: string;
  email?: string | null;
  avatar_template?: string | null;
  avatar_url?: string | null;
  trust_level?: number | null;
};

function isLinuxdoUser(x: unknown): x is LinuxdoUser {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  const hasId = 'id' in o && (typeof o['id'] === 'string' || typeof o['id'] === 'number');
  const hasUsername = typeof o['username'] === 'string';
  return hasId && hasUsername;
}

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
    // 环境变量校验
    const clientId = process.env.NEXT_PUBLIC_LINUXDO_CLIENT_ID;
    const clientSecret = process.env.LINUXDO_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_LINUXDO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Linux.do OAuth env missing', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri,
      });
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }

    // 1. 使用 code 换取 access_token（改为 x-www-form-urlencoded + Basic 认证，更通用）
    const tokenParams = new URLSearchParams();
    tokenParams.set('grant_type', 'authorization_code');
    tokenParams.set('code', code);
    tokenParams.set('redirect_uri', redirectUri);
    // 兼容某些服务端实现：即便使用 Basic，也一并在 body 中传 client_id/secret
    tokenParams.set('client_id', clientId);
    tokenParams.set('client_secret', clientSecret);

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://connect.linux.do/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token response error:', errorText);
      throw new Error('Failed to get access token');
    }

    let tokenDataUnknown: unknown;
    const contentType = tokenResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      tokenDataUnknown = await tokenResponse.json();
    } else {
      const text = await tokenResponse.text();
      try {
        tokenDataUnknown = JSON.parse(text);
      } catch {
        console.error('Token response not JSON:', text);
        throw new Error('Invalid token response');
      }
    }
    if (!isTokenResponse(tokenDataUnknown)) {
      console.error('Token response invalid shape:', tokenDataUnknown);
      throw new Error('Invalid token response shape');
    }
    const accessToken = tokenDataUnknown.access_token;

    // 2. 使用 access_token 获取用户信息（优先 /api/user，失败再回退 /oauth2/userinfo）
    const COMMON_HEADERS: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      // 一些 WAF/CF 会对缺省 UA 触发挑战，这里模拟常见浏览器 UA 以提高成功率
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };

    async function tryFetchUser(url: string): Promise<unknown> {
      const res = await fetch(url, { headers: COMMON_HEADERS });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`status=${res.status} body=${text.slice(0, 500)}`);
      }
      const ct = res.headers.get('content-type') || '';
      const text = await res.text();
      if (!ct.includes('application/json')) {
        // 可能被 WAF/CF 挑战，返回 HTML
        throw new Error(`non-json body=${text.slice(0, 500)}`);
      }
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new Error(`json-parse-failed body=${text.slice(0, 500)}`);
      }
    }

    let linuxdoUser: LinuxdoUser;
    try {
      // 优先官方文档提到的 /api/user
      const u1 = await tryFetchUser('https://connect.linux.do/api/user');
      if (!isLinuxdoUser(u1)) throw new Error('invalid user json from /api/user');
      linuxdoUser = u1;
    } catch (e1) {
      console.warn('Fetch /api/user failed, fallback to /oauth2/userinfo:', e1);
      try {
        const u2 = await tryFetchUser('https://connect.linux.do/oauth2/userinfo');
        if (!isLinuxdoUser(u2)) throw new Error('invalid user json from /oauth2/userinfo');
        linuxdoUser = u2;
      } catch (e2) {
        console.error('User info response error:', e2);
        throw new Error('Failed to get user info');
      }
    }
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
          avatar_url:
            linuxdoUser.avatar_url ||
            (linuxdoUser.avatar_template
              ? linuxdoUser.avatar_template.replace('{size}', '120')
              : null),
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUserId);

      console.log('Existing user logged in:', authUserId);
    } else {
      // 创建新用户 - 使用 Admin API 创建 auth 用户（无需匿名登录）
      isNewUser = true;
      const username = linuxdoUser.username;
      const emailFromProvider: string | null = linuxdoUser.email || null;
      const fallbackEmail = `linuxdo_${linuxdoUser.id}@oauth.local`;
      const userEmail = emailFromProvider || fallbackEmail;

      const { data: created, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          username,
          linuxdo_id: linuxdoUser.id,
          linuxdo_username: linuxdoUser.username,
          linuxdo_trust_level: linuxdoUser.trust_level,
          provider: 'linuxdo',
        },
      });

      if (createUserError || !created?.user) {
        console.error('Admin createUser error:', createUserError);
        throw new Error('Failed to create auth user');
      }

      authUserId = created.user.id;
      console.log('Created auth user:', authUserId);

      // 创建 profile 记录（处理用户名唯一冲突，最多尝试 5 次）
      const baseUsername = username || `user_${linuxdoUser.id}`;
      const avatarUrl =
        linuxdoUser.avatar_url ||
        (linuxdoUser.avatar_template ? linuxdoUser.avatar_template.replace('{size}', '120') : null);

      let profileInserted = false;
      let finalUsername = baseUsername;
      for (let i = 0; i < 5; i++) {
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
          id: authUserId,
          username: finalUsername,
          linuxdo_id: linuxdoUser.id,
          linuxdo_username: linuxdoUser.username,
          linuxdo_trust_level: linuxdoUser.trust_level,
          avatar_url: avatarUrl,
        });

        if (!profileError) {
          profileInserted = true;
          break;
        }

        // 23505 为唯一约束冲突，这里只针对用户名冲突做降级处理
        const isUniqueUsernameConflict = (() => {
          if (typeof profileError !== 'object' || profileError === null) return false;
          const o = profileError as unknown as Record<string, unknown>;
          const code = typeof o['code'] === 'string' ? o['code'] : undefined;
          const message = typeof o['message'] === 'string' ? o['message'] : '';
          return code === '23505' && message.includes('profiles_username_key');
        })();

        if (isUniqueUsernameConflict) {
          // 生成新的候选用户名：优先加上 linuxdo id，之后随机后缀
          if (i === 0) {
            finalUsername = `${baseUsername}_${linuxdoUser.id}`;
          } else if (i === 1) {
            finalUsername = `${baseUsername}_${authUserId.slice(0, 6)}`;
          } else {
            const rand = Math.random().toString(36).slice(2, 6);
            finalUsername = `${baseUsername}_${rand}`;
          }
          continue;
        }

        // 其他错误：直接回滚并抛出
        console.error('Profile create error (non-unique):', profileError);
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        throw new Error('Failed to create profile');
      }

      if (!profileInserted) {
        console.error('Profile create error: username conflict after retries');
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        throw new Error('Failed to create profile');
      }

      console.log('Created profile for new user:', authUserId);
    }

    // 4. 为当前浏览器创建有效 session（对新老用户都通过 magiclink 验证）
    // 需要一个可用邮箱，如果是老用户则从 auth.users 获取
    let emailForSession: string | null = linuxdoUser.email || null;
    if (!emailForSession) {
      // 查询 auth user 以获取其邮箱（可能是我们之前创建的 fallback 邮箱）
      const { data: authUserData, error: getUserError } =
        await supabaseAdmin.auth.admin.getUserById(authUserId);
      if (getUserError) {
        console.error('getUserById error:', getUserError);
      }
      emailForSession = authUserData?.user?.email || `linuxdo_${linuxdoUser.id}@oauth.local`;
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: emailForSession,
      options: {
        redirectTo: state,
      },
    });

    if (linkError || !linkData) {
      console.error('Generate magiclink error:', linkError);
      throw new Error('Failed to generate session link');
    }

    const magicUrl = new URL(linkData.properties.action_link);
    const token = magicUrl.searchParams.get('token');
    if (!token) {
      console.error('No token found in magic link');
      throw new Error('Invalid magiclink');
    }

    const supabaseForSession = await createClient();
    const { error: verifyError } = await supabaseForSession.auth.verifyOtp({
      token_hash: token,
      type: 'magiclink',
    });

    if (verifyError) {
      console.error('Verify token error:', verifyError);
      throw new Error('Failed to create session');
    }

    // 6. 重定向到首页
    const redirectUrl = new URL(state, request.url);
    if (isNewUser) {
      redirectUrl.searchParams.set('welcome', 'true');
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Linux.do OAuth error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
  }
}
export const runtime = 'nodejs';
