'use client';

import { Container, Box, Stack, Tabs, Tab, Skeleton } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import StatsOverview from '@/components/features/statistics/StatsOverview';
import type { Profile } from '@/types/database';

// 动态导入图表组件（这些组件依赖 Recharts，体积较大）
const TrendChart = dynamic(() => import('@/components/features/statistics/TrendChart'), {
  loading: () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
    </Box>
  ),
  ssr: false, // 图表只在客户端渲染
});

const HourlyDistribution = dynamic(
  () => import('@/components/features/statistics/HourlyDistribution'),
  {
    loading: () => (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
      </Box>
    ),
    ssr: false,
  }
);

const HealthImpact = dynamic(() => import('@/components/features/statistics/HealthImpact'), {
  loading: () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
    </Box>
  ),
  ssr: false,
});

interface StatisticsClientProps {
  initialData: {
    profile: Profile | null;
    stats: {
      today: { count: number; cost: number; change: number };
      week: { count: number; cost: number; change: number };
      month: { count: number; cost: number; change: number };
      avgDaily: number;
    };
    dailyTrend: Array<{ date: string; smoke_count: number; total_cost: number }>;
    hourlyData: Array<{ hour: string; count: number }>;
    healthData: {
      totalCigarettes: number;
      totalDays: number;
      moneySaved: number;
      moneySpent: number;
      healthScore: number;
    };
  };
}

export function StatisticsClient({ initialData }: StatisticsClientProps) {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month'>('week');

  const handleTimePeriodChange = (_: React.SyntheticEvent, newValue: 'week' | 'month') => {
    setTimePeriod(newValue);
  };

  // 根据时间周期过滤数据
  const getFilteredChartData = () => {
    if (timePeriod === 'week') {
      // 最近7天
      return initialData.dailyTrend.slice(-7).map(d => ({
        date: format(new Date(d.date), 'MM/dd', { locale: zhCN }),
        count: d.smoke_count,
        cost: d.total_cost,
      }));
    } else {
      // 最近30天
      return initialData.dailyTrend.map(d => ({
        date: format(new Date(d.date), 'dd日', { locale: zhCN }),
        count: d.smoke_count,
        cost: d.total_cost,
      }));
    }
  };

  const chartData = getFilteredChartData();

  return (
    <>
      <TopNavbar user={initialData.profile} />

      <Box
        component={motion.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        sx={{
          flexGrow: 1,
          pb: { xs: 10, md: 4 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Stack spacing={4}>
            {/* 数据概览 */}
            <StatsOverview stats={initialData.stats} />

            {/* 趋势图表 */}
            <Box>
              <Tabs
                value={timePeriod}
                onChange={handleTimePeriodChange}
                sx={{
                  mb: 2,
                  '& .MuiTabs-indicator': {
                    bgcolor: 'primary.main',
                    height: 3,
                    borderRadius: 1.5,
                  },
                }}
              >
                <Tab
                  label="最近7天"
                  value="week"
                  sx={{
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  }}
                />
                <Tab
                  label="最近30天"
                  value="month"
                  sx={{
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  }}
                />
              </Tabs>
              <TrendChart data={chartData} period={timePeriod} />
            </Box>

            {/* 时段分布 */}
            <HourlyDistribution data={initialData.hourlyData} />

            {/* 健康影响 */}
            <HealthImpact data={initialData.healthData} />
          </Stack>
        </Container>
      </Box>

      <BottomNav />
    </>
  );
}
