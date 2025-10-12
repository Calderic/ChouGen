'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores/navigation';

// 监听路径变化以结束一次导航 pending
export function NavigationLifecycle() {
  const pathname = usePathname();
  const stop = useNavigationStore(s => s.stop);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    stop();
  }, [pathname, stop]);

  return null;
}
