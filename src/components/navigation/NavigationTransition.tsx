'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, LinearProgress } from '@mui/material';
import { useNavigationStore } from '@/lib/stores/navigation';

/**
 * 页面导航过渡动画
 * 提供即时视觉反馈，无需等待 Next.js loading.tsx
 */
export function NavigationTransition() {
  const [visible, setVisible] = useState(false);
  const didMountRef = useRef(false);
  const pendingCount = useNavigationStore(s => s.pendingCount);
  const isPending = pendingCount > 0;

  useEffect(() => {
    // 初次渲染不展示，避免无意义闪烁
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const showDelay = 120; // 显示阈值，避免极短跳转闪烁
    const minVisible = 200; // 最小展示时长，保证连贯感

    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (isPending) {
      // 等待超过阈值再显示
      showTimer = setTimeout(() => setVisible(true), showDelay);
    } else {
      // 若正在显示，保证最小时长后再隐藏
      hideTimer = setTimeout(() => setVisible(false), minVisible);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isPending]);

  if (!visible) return null;

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
