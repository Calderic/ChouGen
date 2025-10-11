'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, LinearProgress } from '@mui/material';

/**
 * 页面导航过渡动画
 * 提供即时视觉反馈，无需等待 Next.js loading.tsx
 */
export function NavigationTransition() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // 路径变化时显示过渡
    setIsNavigating(true);

    // 给予足够时间让页面渲染
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <LinearProgress
        sx={{
          height: 3,
          bgcolor: 'transparent',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'primary.main',
          },
        }}
      />
    </Box>
  );
}
