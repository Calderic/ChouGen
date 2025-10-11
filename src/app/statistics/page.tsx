'use client';

import { Container, Box, Stack, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import StatsOverview from '@/components/features/statistics/StatsOverview';
import TrendChart from '@/components/features/statistics/TrendChart';
import HourlyDistribution from '@/components/features/statistics/HourlyDistribution';
import HealthImpact from '@/components/features/statistics/HealthImpact';

// 模拟数据
const mockUser = {
  username: '测试用户',
  avatar_url: null,
};

// 最近7天数据
const mockWeekData = [
  { date: '01/05', count: 12, cost: 39.0 },
  { date: '01/06', count: 15, cost: 48.75 },
  { date: '01/07', count: 10, cost: 32.5 },
  { date: '01/08', count: 14, cost: 45.5 },
  { date: '01/09', count: 8, cost: 26.0 },
  { date: '01/10', count: 13, cost: 42.25 },
  { date: '01/11', count: 11, cost: 35.75 },
];

// 最近30天数据（简化版）
const mockMonthData = Array.from({ length: 30 }, (_, i) => ({
  date: `${String(i + 1).padStart(2, '0')}日`,
  count: Math.floor(Math.random() * 10) + 8,
  cost: (Math.random() * 20 + 25).toFixed(2),
}));

// 时段分布数据
const mockHourlyData = [
  { hour: '0-2', count: 2 },
  { hour: '2-4', count: 0 },
  { hour: '4-6', count: 1 },
  { hour: '6-8', count: 8 },
  { hour: '8-10', count: 15 },
  { hour: '10-12', count: 12 },
  { hour: '12-14', count: 10 },
  { hour: '14-16', count: 18 },
  { hour: '16-18', count: 14 },
  { hour: '18-20', count: 11 },
  { hour: '20-22', count: 7 },
  { hour: '22-24', count: 4 },
];

// 统计概览数据
const mockStats = {
  today: { count: 8, cost: 26.0, change: -20 },
  week: { count: 83, cost: 269.75, change: 5 },
  month: { count: 342, cost: 1112.5, change: -8 },
  avgDaily: 11.4,
};

// 健康数据
const mockHealthData = {
  totalCigarettes: 1245,
  totalDays: 109,
  moneySaved: 0, // 没有省钱，因为还在抽烟
  moneySpent: 3850.5,
  healthScore: 35, // 健康分数（满分100）
};

export default function StatisticsPage() {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month'>('week');

  const handleTimePeriodChange = (_: React.SyntheticEvent, newValue: 'week' | 'month') => {
    setTimePeriod(newValue);
  };

  const chartData = timePeriod === 'week' ? mockWeekData : mockMonthData;

  return (
    <>
      <TopNavbar user={mockUser} />

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
            <StatsOverview stats={mockStats} />

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
            <HourlyDistribution data={mockHourlyData} />

            {/* 健康影响 */}
            <HealthImpact data={mockHealthData} />
          </Stack>
        </Container>
      </Box>

      <BottomNav />
    </>
  );
}
