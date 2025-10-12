import { redirect } from 'next/navigation';
import { getHomePageData } from '@/lib/services/server/home';
import { HomeClient } from '@/app/home-client';

export default async function HomePage() {
  // 服务端直接获取数据
  const data = await getHomePageData();

  if (!data || !data.profile) {
    // 未登录，重定向到登录页
    redirect('/auth/login');
  }

  // 将数据传递给客户端组件
  return <HomeClient initialData={data} />;
}
