'use client';

import { Container, Box, Stack, Tabs, Tab, Skeleton, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import StatsOverview from '@/components/features/statistics/StatsOverview';
import ViolationRecordList from '@/components/features/interval/ViolationRecordList';
import { getViolations } from '@/lib/services/client/interval-control';
import type { Profile, ViolationLog } from '@/types/database';

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
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'violations'>('week');
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [loadingViolations, setLoadingViolations] = useState(false);

  const handleTimePeriodChange = (
    _: React.SyntheticEvent,
    newValue: 'week' | 'month' | 'violations'
  ) => {
    setTimePeriod(newValue);
  };

  // 加载违规记录
  useEffect(() => {
    if (timePeriod === 'violations') {
      const loadViolations = async () => {
        setLoadingViolations(true);
        const result = await getViolations(50);
        if (result.success && result.data) {
          setViolations(result.data);
        }
        setLoadingViolations(false);
      };
      loadViolations();
    }
  }, [timePeriod]);

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
    <Container maxWidth="md" sx={{ py: 4, pb: { xs: 10, md: 4 } }}>
      <Stack spacing={4}>
        {/* 数据概览 */}
        <StatsOverview stats={initialData.stats} />

        {/* Tab 切换 */}
        <Box>
          <Tabs
            value={timePeriod}
            onChange={handleTimePeriodChange}
            sx={{
              mb: 3,
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
            <Tab
              label="违规记录"
              value="violations"
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'error.main',
                },
              }}
            />
          </Tabs>

          {/* 趋势图表 (week/month) */}
          {(timePeriod === 'week' || timePeriod === 'month') && (
            <>
              <TrendChart data={chartData} period={timePeriod} />

              {/* 时段分布 */}
              <Box sx={{ mt: 4 }}>
                <HourlyDistribution data={initialData.hourlyData} />
              </Box>

              {/* 健康影响 */}
              <Box sx={{ mt: 4 }}>
                <HealthImpact data={initialData.healthData} />
              </Box>
            </>
          )}

          {/* 违规记录列表 */}
          {timePeriod === 'violations' && (
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                违规记录
              </Typography>
              {loadingViolations ? (
                <Box sx={{ py: 4 }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Box>
              ) : (
                <ViolationRecordList violations={violations} />
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
