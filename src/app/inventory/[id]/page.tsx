import { redirect } from 'next/navigation';
import { getInventoryDetailPageData } from '@/lib/services/server/inventory';
import { DetailClient } from './detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PackDetailPage({ params }: PageProps) {
  const { id: packId } = await params;

  // 服务端直接获取数据
  const data = await getInventoryDetailPageData(packId);

  if (!data || !data.profile || !data.pack) {
    // 未登录或香烟包不存在，重定向
    redirect('/inventory');
  }

  // 将数据传递给客户端组件
  return <DetailClient initialData={data} />;
}
