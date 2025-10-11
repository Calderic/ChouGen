'use client';

import { Box, Typography, Paper } from '@mui/material';
import { SmokingRooms as SmokingIcon, LocalAtm as MoneyIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface MyRankingProps {
  ranking: {
    rank: number;
    smoke_count: number;
    total_cost: number;
  } | null;
}

export default function MyRanking({ ranking }: MyRankingProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // 滚动阈值，超过此值才触发显示/隐藏
      const hideThreshold = 50; // 向下滚动多少像素后隐藏

      // 标记正在滚动
      isScrollingRef.current = true;

      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 判断是否应该显示或隐藏
      if (currentScrollY < scrollThreshold) {
        // 接近顶部时始终显示
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > hideThreshold) {
        // 向下滚动且超过阈值时隐藏
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // 向上滚动时显示
        setIsVisible(true);
      }

      // 设置防抖，停止滚动200ms后重新显示
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        setIsVisible(true);
      }, 200);

      setLastScrollY(currentScrollY);
    };

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  if (!ranking) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 88, md: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 'calc(100% - 32px)', sm: 600 },
            maxWidth: 600,
            zIndex: 999,
            px: 2,
          }}
        >
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            elevation={0}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
                px: 2.5,
              }}
            >
              {/* 左侧：排名标签 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="white" sx={{ fontSize: '1rem' }}>
                    {ranking.rank}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    我的排名
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    第 {ranking.rank} 名
                  </Typography>
                </Box>
              </Box>

              {/* 右侧：统计数据 */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexShrink: 0 }}
              >
                {/* 抽烟数 */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem', display: 'block', whiteSpace: 'nowrap' }}
                  >
                    抽烟数
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <SmokingIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {ranking.smoke_count} 支
                    </Typography>
                  </Box>
                </Box>

                {/* 分隔线 */}
                <Box
                  sx={{
                    width: 1,
                    height: 32,
                    bgcolor: 'divider',
                    display: { xs: 'none', sm: 'block' },
                  }}
                />

                {/* 花费 */}
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem', display: 'block', whiteSpace: 'nowrap' }}
                  >
                    总花费
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="success.main"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      ¥{ranking.total_cost.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </AnimatePresence>
  );
}
