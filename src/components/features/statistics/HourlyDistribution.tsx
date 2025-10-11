'use client';

import { Box, Typography, Paper, Chip } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AccessTime as ClockIcon } from '@mui/icons-material';

interface HourlyDataPoint {
  hour: string;
  count: number;
}

interface HourlyDistributionProps {
  data: HourlyDataPoint[];
}

export default function HourlyDistribution({ data }: HourlyDistributionProps) {
  // 找出最高峰时段
  const maxCount = Math.max(...data.map(d => d.count));
  const peakHour = data.find(d => d.count === maxCount);

  // 根据数量设置颜色深浅
  const getColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#ef4444'; // 红色 - 高峰
    if (intensity > 0.4) return '#f59e0b'; // 橙色 - 中等
    return '#2563eb'; // 蓝色 - 低峰
  };

  // 自定义 Tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: HourlyDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {payload[0].payload.hour}点
          </Typography>
          <Typography variant="caption" color="primary.main">
            抽烟 {payload[0].value} 支
          </Typography>
        </Paper>
      );
    }
    return null;
  };

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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          时段分布
        </Typography>
        {peakHour && (
          <Chip
            icon={<ClockIcon sx={{ fontSize: 16 }} />}
            label={`高峰：${peakHour.hour}点`}
            size="small"
            sx={{
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: '#ef4444',
              },
            }}
          />
        )}
      </Box>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 说明 */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          24小时抽烟时段分布 · 颜色越深表示抽烟越多
        </Typography>
      </Box>
    </Paper>
  );
}
