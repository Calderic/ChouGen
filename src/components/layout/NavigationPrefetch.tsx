'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 导航预加载组件
 * 在应用加载时预取常访问的页面，提升导航速度
 */
export default function NavigationPrefetch() {
  const router = useRouter();

  useEffect(() => {
    // 预取主要页面路由
    const routesToPrefetch = ['/', '/leaderboard', '/inventory', '/statistics', '/profile'];

    routesToPrefetch.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return null; // 不渲染任何 UI
}
