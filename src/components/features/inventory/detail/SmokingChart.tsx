'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { format, parseISO, startOfDay, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SmokingRecord {
  id: string;
  smoked_at: string;
  cost: number;
}

interface SmokingChartProps {
  records: SmokingRecord[];
}

export default function SmokingChart({ records }: SmokingChartProps) {
  if (records.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          borderRadius: 3,
          p: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          暂无抽烟记录
        </Typography>
      </Card>
    );
  }

  // 按日期分组统计
  const dailyStats = records.reduce((acc, record) => {
    const date = format(parseISO(record.smoked_at), 'MM-dd', { locale: zhCN });
    if (!acc[date]) {
      acc[date] = { count: 0, cost: 0 };
    }
    acc[date].count += 1;
    acc[date].cost += record.cost;
    return acc;
  }, {} as Record<string, { count: number; cost: number }>);

  const dates = Object.keys(dailyStats).reverse(); // 最早到最晚
  const maxCount = Math.max(...Object.values(dailyStats).map((s) => s.count));

  // 按小时分组统计（24小时分布）
  const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0,
  }));

  records.forEach((record) => {
    const hour = parseISO(record.smoked_at).getHours();
    hourlyStats[hour].count += 1;
  });

  const maxHourlyCount = Math.max(...hourlyStats.map((s) => s.count));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 每日抽烟趋势 */}
      <Card
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            每日抽烟趋势
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            展示每天的抽烟数量变化
          </Typography>

          {/* 柱状图 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: 200,
              gap: 1,
              px: 2,
            }}
          >
            {dates.map((date) => {
              const stat = dailyStats[date];
              const height = (stat.count / maxCount) * 100;

              return (
                <Box
                  key={date}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    maxWidth: 60,
                  }}
                >
                  {/* 数值 */}
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="primary.main"
                    sx={{ mb: 0.5 }}
                  >
                    {stat.count}
                  </Typography>

                  {/* 柱子 */}
                  <Box
                    sx={{
                      width: '100%',
                      height: `${height}%`,
                      minHeight: stat.count > 0 ? 20 : 0,
                      bgcolor: 'primary.main',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'scaleY(1.05)',
                      },
                    }}
                  />

                  {/* 日期标签 */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, fontSize: '0.65rem' }}
                  >
                    {date}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* 24小时抽烟分布 */}
      <Card
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            24小时抽烟分布
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            展示一天中不同时段的抽烟频率
          </Typography>

          {/* 热力图 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 1,
            }}
          >
            {hourlyStats.map((stat) => {
              const intensity = maxHourlyCount > 0 ? stat.count / maxHourlyCount : 0;
              const opacity = intensity > 0 ? 0.3 + intensity * 0.7 : 0.1;

              return (
                <Box
                  key={stat.hour}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    opacity: opacity,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.2s',
                    cursor: stat.count > 0 ? 'pointer' : 'default',
                    '&:hover': {
                      opacity: stat.count > 0 ? 1 : opacity,
                      transform: stat.count > 0 ? 'scale(1.1)' : 'none',
                    },
                  }}
                  title={`${stat.hour}:00 - ${stat.count}支`}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: intensity > 0.5 ? 'white' : 'text.secondary',
                    }}
                  >
                    {stat.hour}
                  </Typography>
                  {stat.count > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.5rem',
                        fontWeight: 700,
                        color: 'white',
                      }}
                    >
                      {stat.count}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* 图例 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              低
            </Typography>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
              <Box
                key={opacity}
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 0.5,
                  bgcolor: 'primary.main',
                  opacity: opacity,
                }}
              />
            ))}
            <Typography variant="caption" color="text.secondary">
              高
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
