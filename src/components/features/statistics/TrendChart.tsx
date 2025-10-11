'use client';

import { Box, Typography, Paper } from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  count: number;
  cost: string | number;
}

interface TrendChartProps {
  data: ChartDataPoint[];
  period: 'week' | 'month';
}

export default function TrendChart({ data, period }: TrendChartProps) {
  // 自定义 Tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: ChartDataPoint }>;
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
            {payload[0].payload.date}
          </Typography>
          <Typography variant="caption" color="primary.main" display="block">
            抽烟：{payload[0].value} 支
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            花费：¥
            {typeof payload[0].payload.cost === 'number'
              ? payload[0].payload.cost.toFixed(2)
              : payload[0].payload.cost}
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
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        抽烟趋势
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#colorCount)"
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* 图表说明 */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {period === 'week' ? '最近7天' : '最近30天'}的抽烟数量变化趋势
        </Typography>
      </Box>
    </Paper>
  );
}
