import type { Metadata } from 'next';
import ThemeRegistry from '@/components/layout/ThemeRegistry';
import MainLayout from '@/components/layout/MainLayout';
import AchievementProvider from '@/components/providers/AchievementProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import { getCurrentUser } from '@/lib/services/server/user';
import './globals.css';

export const metadata: Metadata = {
  title: '抽根 - 香烟记录应用',
  description: '记录你的抽烟习惯，了解你的消费数据',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 从环境变量获取 Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).origin : '';

  // 服务端获取用户信息（仅一次）
  const user = await getCurrentUser();

  return (
    <html lang="zh-CN">
      <head>
        {/* DNS 预解析和预连接 Supabase，减少首次请求延迟 */}
        {supabaseDomain && (
          <>
            <link rel="dns-prefetch" href={supabaseDomain} />
            <link rel="preconnect" href={supabaseDomain} crossOrigin="anonymous" />
          </>
        )}
      </head>
      <body>
        <ThemeRegistry>
          <UserProvider user={user}>
            <AchievementProvider>
              <MainLayout>{children}</MainLayout>
            </AchievementProvider>
          </UserProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
