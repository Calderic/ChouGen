'use client';

import { Button, type ButtonProps } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

interface SmartNavButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string;
  prefetch?: boolean;
}

/**
 * 智能导航按钮
 * - 悬停预加载
 * - 点击时使用 startTransition 保持 UI 响应
 * - 防抖优化
 */
export function SmartNavButton({ href, prefetch = true, children, ...props }: SmartNavButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [hasPrefetched, setHasPrefetched] = useState(false);

  const isActive = pathname === href;

  // 预加载函数
  const handlePrefetch = () => {
    if (prefetch && !hasPrefetched && !isActive) {
      router.prefetch(href);
      setHasPrefetched(true);
    }
  };

  // 导航函数
  const handleClick = () => {
    if (!isActive) {
      startTransition(() => {
        router.push(href);
      });
    }
  };

  // 当路径变化时重置预加载状态
  useEffect(() => {
    setHasPrefetched(false);
  }, [pathname]);

  return (
    <Button
      {...props}
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch} // 移动端支持
      disabled={isPending || props.disabled}
      sx={{
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.2s',
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
}
