import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware - 路由保护和身份验证
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 刷新 session（如果存在）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 公开路径（不需要登录）
  const publicPaths = ['/auth/login', '/auth/register', '/api/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 如果是公开路径，直接放行
  if (isPublicPath) {
    return supabaseResponse;
  }

  // 如果未登录且访问受保护页面，跳转到登录页
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', pathname); // 记录原始访问路径
    return NextResponse.redirect(redirectUrl);
  }

  // 已登录且访问登录页，跳转到首页
  if (user && pathname === '/auth/login') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
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
