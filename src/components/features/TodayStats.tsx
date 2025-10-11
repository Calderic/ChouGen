'use client';

import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import {
  SmokingRooms as SmokingIcon,
  LocalAtm as MoneyIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface TodayStatsProps {
  todayCount: number;
  todayCost: number;
  weekCount?: number;
  monthCount?: number;
}

const StatCard = motion(Card);

export default function TodayStats({
  todayCount,
  todayCost,
  weekCount,
  monthCount: _monthCount,
}: TodayStatsProps) {
  const stats = [
    {
      label: '今日已抽',
      value: todayCount,
      unit: '支',
      icon: <SmokingIcon />,
      color: 'primary.main',
      bgcolor: 'primary.lighter',
    },
    {
      label: '今日花费',
      value: `¥${todayCost.toFixed(2)}`,
      unit: '',
      icon: <MoneyIcon />,
      color: 'success.main',
      bgcolor: 'success.lighter',
    },
    {
      label: '本周累计',
      value: weekCount || 0,
      unit: '支',
      icon: <TrendIcon />,
      color: 'warning.main',
      bgcolor: 'warning.lighter',
    },
  ];

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        gutterBottom
        display="block"
        sx={{ mb: 1.5, fontWeight: 500 }}
      >
        数据概览
      </Typography>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 4 }} key={stat.label}>
            <StatCard
              elevation={0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                borderRadius: 2.5,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* 图标 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: stat.bgcolor,
                    color: stat.color,
                    mb: 1.5,
                  }}
                >
                  {stat.icon}
                </Box>

                {/* 数值 */}
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                  {stat.unit && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {stat.unit}
                    </Typography>
                  )}
                </Typography>

                {/* 标签 */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontWeight: 500 }}
                >
                  {stat.label}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
