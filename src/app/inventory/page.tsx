import { redirect } from 'next/navigation';
import { getInventoryPageData } from '@/lib/services/server/inventory';
import { InventoryClient } from './inventory-client';

export default async function InventoryPage() {
  // 服务端直接获取数据
  const data = await getInventoryPageData();

  if (!data || !data.profile) {
    // 未登录，重定向到登录页
    redirect('/auth/login');
  }

  // 将数据传递给客户端组件
  return <InventoryClient initialData={data} />;
}
