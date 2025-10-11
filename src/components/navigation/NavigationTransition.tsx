'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, LinearProgress } from '@mui/material';

/**
 * 页面导航过渡动画
 * 提供即时视觉反馈，无需等待 Next.js loading.tsx
 */
export function NavigationTransition() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const didMountRef = useRef(false);

  useEffect(() => {
    // 初次渲染不展示，避免无意义闪烁
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const showDelay = 120; // 显示阈值，避免极短跳转闪烁
    const minVisible = 200; // 最小展示时长，保证连贯感

    const showTimer = setTimeout(() => {
      setIsNavigating(true);
    }, showDelay);

    const hideTimer = setTimeout(() => {
      setIsNavigating(false);
    }, showDelay + minVisible);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <Box
      sx={theme => ({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar + 1,
        pointerEvents: 'none',
      })}
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
