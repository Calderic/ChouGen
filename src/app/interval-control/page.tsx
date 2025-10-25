import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { IntervalControlClient } from './interval-control-client';

export const metadata = {
  title: '间隔控制 - 抽根',
  description: '设置抽烟间隔和电子锁功能',
};

export default async function IntervalControlPage() {
  const supabase = await createClient();

  // 验证登录
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirect=/interval-control');
  }

  // 获取用户的间隔设置
  const { data: profile } = await supabase
    .from('profiles')
    .select('smoke_interval_enabled, smoke_interval_minutes')
    .eq('id', user.id)
    .single();

  const initialSettings = {
    enabled: profile?.smoke_interval_enabled || false,
    minutes: profile?.smoke_interval_minutes || null,
  };

  return <IntervalControlClient initialSettings={initialSettings} />;
}
