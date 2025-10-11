import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware - 路由保护和身份验证
 */
export async function middleware(request: NextRequest) {
  // ⚠️ 重要: 缓存 Supabase 要设置的 Cookie,避免重定向时丢失
  const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // 仅缓存 Cookie,不立即写入响应
        setAll(cookies) {
          cookies.forEach(c => cookiesToSet.push(c));
        },
      },
    }
  );

  // 统一应用 Cookie 到响应对象
  const applyCookies = (res: NextResponse) => {
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  };

  // 刷新 session（如果存在）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // ⚠️ 优先处理: 已登录用户访问认证页面,直接跳转首页
  if (user && pathname.startsWith('/auth')) {
    const redirectUrl = new URL('/', request.url);
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  // 公开路径（不需要登录）
  const publicPaths = ['/auth/login', '/auth/register', '/api/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 如果是公开路径，直接放行
  if (isPublicPath) {
    return applyCookies(NextResponse.next({ request }));
  }

  // 如果未登录且访问受保护页面，跳转到登录页
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    // 保留完整路径(包括 query 参数)
    const redirectFrom = `${pathname}${search}`;
    redirectUrl.searchParams.set('redirect', redirectFrom);
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  return applyCookies(NextResponse.next({ request }));
}

/**
 * Middleware 匹配规则
 * - 排除静态文件、图片、favicon 等
 * - 只匹配应用路由
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (favicon 文件)
     * - public 文件夹中的文件 (*.png, *.jpg, *.svg, 等)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
