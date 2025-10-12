'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type PageTransitionContextValue = {
  suppressInitialMotion: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue>({
  suppressInitialMotion: false,
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [suppress, setSuppress] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    // 首次渲染不触发，路由变化时在短时窗口内抑制子组件初始动画
    if (first.current) {
      first.current = false;
      return;
    }

    setSuppress(true);
    const t = setTimeout(() => setSuppress(false), 240);
    return () => clearTimeout(t);
  }, [pathname]);

  const value = useMemo(() => ({ suppressInitialMotion: suppress }), [suppress]);

  return <PageTransitionContext.Provider value={value}>{children}</PageTransitionContext.Provider>;
}
