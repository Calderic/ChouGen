import { redirect } from 'next/navigation';
import { getProfilePageData } from '@/lib/services/server/profile';
import { ProfileClient } from './profile-client';

export default async function ProfilePage() {
  // 服务端直接获取数据
  const data = await getProfilePageData();

  if (!data || !data.profile) {
    // 未登录，重定向到登录页
    redirect('/auth/login');
  }

  // 将数据传递给客户端组件
  return <ProfileClient initialData={data} />;
}
