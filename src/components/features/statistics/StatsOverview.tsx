'use client';

import { Box, Typography, Paper, Grid, Stack } from '@mui/material';
import {
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  CalendarToday as TodayIcon,
  DateRange as WeekIcon,
  Event as MonthIcon,
} from '@mui/icons-material';

interface StatsData {
  today: { count: number; cost: number; change: number };
  week: { count: number; cost: number; change: number };
  month: { count: number; cost: number; change: number };
  avgDaily: number;
}

interface StatsOverviewProps {
  stats: StatsData;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  cost: number;
  change: number;
  color: string;
}

function StatCard({ icon, label, count, cost, change, color }: StatCardProps) {
  const isPositive = change > 0;
  const TrendIcon = isPositive ? UpIcon : DownIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        borderRadius: 3,
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>

          {/* 变化趋势 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: isPositive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            }}
          >
            <TrendIcon
              sx={{
                fontSize: 16,
                color: isPositive ? '#ef4444' : '#10b981',
              }}
            />
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                color: isPositive ? '#ef4444' : '#10b981',
              }}
            >
              {Math.abs(change)}%
            </Typography>
          </Box>
        </Stack>

        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            {count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¥{cost.toFixed(2)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        数据概览
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<TodayIcon />}
            label="今日"
            count={stats.today.count}
            cost={stats.today.cost}
            change={stats.today.change}
            color="#2563eb"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<WeekIcon />}
            label="本周"
            count={stats.week.count}
            cost={stats.week.cost}
            change={stats.week.change}
            color="#f59e0b"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<MonthIcon />}
            label="本月"
            count={stats.month.count}
            cost={stats.month.cost}
            change={stats.month.change}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* 日均数据 */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2.5,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          borderRadius: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            日均抽烟量
          </Typography>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {stats.avgDaily.toFixed(1)} 支/天
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
