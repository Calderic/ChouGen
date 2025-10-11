import { redirect } from 'next/navigation';
import { getLeaderboardPageData } from '@/lib/services/server/leaderboard';
import { LeaderboardClient } from './leaderboard-client';

type LeaderboardPeriod = 'day' | 'week' | 'month' | 'all';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (params.period || 'week') as LeaderboardPeriod;

  // 服务端直接获取数据
  const data = await getLeaderboardPageData(period);

  if (!data || !data.profile) {
    // 未登录，重定向到登录页
    redirect('/auth/login');
  }

  // 将数据传递给客户端组件
  return <LeaderboardClient initialData={data} />;
}
