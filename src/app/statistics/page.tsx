import { redirect } from 'next/navigation';
import { getStatisticsPageData } from '@/lib/services/server/statistics';
import { StatisticsClient } from './statistics-client';

export default async function StatisticsPage() {
  // 服务端直接获取数据
  const data = await getStatisticsPageData();

  if (!data || !data.profile) {
    // 未登录，重定向到登录页
    redirect('/auth/login');
  }

  // 将数据传递给客户端组件
  return <StatisticsClient initialData={data} />;
}
