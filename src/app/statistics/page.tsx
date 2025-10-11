'use client';

import { Container, Box, Stack, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import StatsOverview from '@/components/features/statistics/StatsOverview';
import TrendChart from '@/components/features/statistics/TrendChart';
import HourlyDistribution from '@/components/features/statistics/HourlyDistribution';
import HealthImpact from '@/components/features/statistics/HealthImpact';
import { getCurrentUserProfile } from '@/lib/services/profile';
import {
  getStatsOverview,
  getDailyTrend,
  getHourlyDistribution,
  getHealthImpact,
} from '@/lib/services/statistics';
import type { Profile } from '@/types/database';

export default function StatisticsPage() {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month'>('week');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<{
    today: { count: number; cost: number; change: number };
    week: { count: number; cost: number; change: number };
    month: { count: number; cost: number; change: number };
    avgDaily: number;
  } | null>(null);
  const [dailyTrend, setDailyTrend] = useState<
    Array<{ date: string; smoke_count: number; total_cost: number }>
  >([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; count: number }>>([]);
  const [healthData, setHealthData] = useState<{
    totalCigarettes: number;
    totalDays: number;
    moneySaved: number;
    moneySpent: number;
    healthScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileData, statsData, trendData, hourlyDistData, healthImpactData] =
        await Promise.all([
          getCurrentUserProfile(),
          getStatsOverview(),
          getDailyTrend(),
          getHourlyDistribution(),
          getHealthImpact(),
        ]);

      if (!profileData) {
        setError('无法加载用户资料');
      } else {
        setProfile(profileData);
        setStats(statsData);
        setDailyTrend(trendData);
        setHourlyData(hourlyDistData);
        setHealthData(healthImpactData);
      }
    } catch (err) {
      setError('加载数据失败');
      console.error('加载统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimePeriodChange = (_: React.SyntheticEvent, newValue: 'week' | 'month') => {
    setTimePeriod(newValue);
  };

  // 根据时间周期过滤数据
  const getFilteredChartData = () => {
    if (timePeriod === 'week') {
      // 最近7天
      return dailyTrend.slice(-7).map(d => ({
        date: format(new Date(d.date), 'MM/dd', { locale: zhCN }),
        count: d.smoke_count,
        cost: d.total_cost,
      }));
    } else {
      // 最近30天
      return dailyTrend.map(d => ({
        date: format(new Date(d.date), 'dd日', { locale: zhCN }),
        count: d.smoke_count,
        cost: d.total_cost,
      }));
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <>
        <TopNavbar user={null} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress />
        </Box>
        <BottomNav />
      </>
    );
  }

  // 错误状态
  if (error || !profile || !stats || !healthData) {
    return (
      <>
        <TopNavbar user={profile} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error || '加载失败'}
          </Alert>
        </Box>
        <BottomNav />
      </>
    );
  }

  const chartData = getFilteredChartData();

  return (
    <>
      <TopNavbar user={profile} />

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
            <StatsOverview stats={stats} />

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
            <HourlyDistribution data={hourlyData} />

            {/* 健康影响 */}
            <HealthImpact data={healthData} />
          </Stack>
        </Container>
      </Box>

      <BottomNav />
    </>
  );
}
