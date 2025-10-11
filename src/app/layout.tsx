import type { Metadata } from 'next';
import ThemeRegistry from '@/components/layout/ThemeRegistry';
import AchievementProvider from '@/components/providers/AchievementProvider';
import './globals.css';

export const metadata: Metadata = {
  title: '抽根 - 香烟记录应用',
  description: '记录你的抽烟习惯，了解你的消费数据',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeRegistry>
          <AchievementProvider>{children}</AchievementProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
