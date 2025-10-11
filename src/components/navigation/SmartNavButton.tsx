'use client';

import { Button, type ButtonProps as MuiButtonProps } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect, type MouseEventHandler } from 'react';

interface SmartNavButtonProps extends Omit<MuiButtonProps<'a'>, 'onClick'> {
  href: string;
  prefetch?: boolean;
}

/**
 * 智能导航按钮
 * - 悬停/聚焦预加载
 * - 左键点击时使用 startTransition 保持 UI 响应
 * - 保留中键/修饰键的原生新开行为
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

  // 导航函数（仅拦截左键非修饰键点击）
  const handleClick: MouseEventHandler<HTMLAnchorElement> = e => {
    if (isActive) return;
    // 允许中键/修饰键保持默认新开行为
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  // 当路径变化时重置预加载状态
  useEffect(() => {
    setHasPrefetched(false);
  }, [pathname]);

  return (
    <Button
      {...props}
      component="a"
      href={href}
      aria-current={isActive ? 'page' : undefined}
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
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
