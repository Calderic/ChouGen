'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  Whatshot as HotIcon,
  WbSunny as DayIcon,
  Nightlight as NightIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { parseISO, differenceInMinutes, getHours } from 'date-fns';

interface Pack {
  name: string;
  brand?: string;
  total_count: number;
  price: number;
}

interface SmokingRecord {
  id: string;
  smoked_at: string;
  cost: number;
}

interface PackAnalysisProps {
  pack: Pack;
  records: SmokingRecord[];
  smokedCount: number;
}

export default function PackAnalysis({
  pack,
  records,
  smokedCount: _smokedCount,
}: PackAnalysisProps) {
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
          暂无数据可分析
        </Typography>
      </Card>
    );
  }

  // 排序记录
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.smoked_at).getTime() - new Date(b.smoked_at).getTime()
  );

  // 计算平均间隔时间（除去睡觉时间 23:00-7:00）
  const intervals: number[] = [];
  for (let i = 1; i < sortedRecords.length; i++) {
    const prevTime = parseISO(sortedRecords[i - 1].smoked_at);
    const currentTime = parseISO(sortedRecords[i].smoked_at);
    const minutes = differenceInMinutes(currentTime, prevTime);

    // 排除超过8小时的间隔（可能是睡觉时间）
    if (minutes < 480) {
      intervals.push(minutes);
    }
  }

  const avgInterval =
    intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;
  const avgIntervalHours = Math.floor(avgInterval / 60);
  const avgIntervalMinutes = avgInterval % 60;

  // 最快间隔
  const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;
  const minIntervalStr = `${Math.floor(minInterval / 60)}小时${minInterval % 60}分钟`;

  // 白天 vs 晚上
  const daytimeCount = records.filter(r => {
    const hour = getHours(parseISO(r.smoked_at));
    return hour >= 6 && hour < 18;
  }).length;
  const nighttimeCount = records.length - daytimeCount;
  const daytimePercent = ((daytimeCount / records.length) * 100).toFixed(0);
  const nighttimePercent = ((nighttimeCount / records.length) * 100).toFixed(0);

  // 最爱时段（抽烟最多的小时）
  const hourStats: Record<number, number> = {};
  records.forEach(r => {
    const hour = getHours(parseISO(r.smoked_at));
    hourStats[hour] = (hourStats[hour] || 0) + 1;
  });
  const favHour = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0];
  const favHourStr = favHour ? `${favHour[0]}:00` : '未知';
  const favHourCount = favHour ? favHour[1] : 0;

  // 统计卡片
  const stats = [
    {
      title: '平均抽烟间隔',
      value:
        avgIntervalHours > 0
          ? `${avgIntervalHours}小时${avgIntervalMinutes}分`
          : `${avgIntervalMinutes}分钟`,
      subtitle: '除去睡觉时间',
      icon: <HotIcon />,
      color: 'error',
    },
    {
      title: '最快连抽',
      value: minIntervalStr,
      subtitle: '两支烟的最短间隔',
      icon: <TrendIcon />,
      color: 'warning',
    },
    {
      title: '最爱时段',
      value: favHourStr,
      subtitle: `抽了 ${favHourCount} 支`,
      icon: <HotIcon />,
      color: 'primary',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 统计卡片 */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}
      >
        {stats.map((stat, index) => (
          <Card
            key={index}
            elevation={0}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: `${stat.color}.lighter`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  color: `${stat.color}.main`,
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
                display="block"
                gutterBottom
              >
                {stat.title}
              </Typography>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 白天 vs 晚上 */}
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
            白天 vs 晚上
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            6:00-18:00 为白天，18:00-6:00 为晚上
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {/* 白天 */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DayIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  白天
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${daytimePercent}%`,
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'width 0.3s',
                  }}
                >
                  <Typography variant="body2" fontWeight={700} color="white">
                    {daytimePercent}%
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {daytimeCount} 支
              </Typography>
            </Box>

            {/* 晚上 */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <NightIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  晚上
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${nighttimePercent}%`,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'width 0.3s',
                  }}
                >
                  <Typography variant="body2" fontWeight={700} color="white">
                    {nighttimePercent}%
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {nighttimeCount} 支
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 有趣的洞察 */}
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
            有趣的洞察
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.main',
              }}
            >
              <Typography variant="body2" color="info.main" fontWeight={600}>
                💨 如果按这个速度，{pack.total_count}支烟大约需要{' '}
                {Math.round((pack.total_count * avgInterval) / 60 / 24)} 天抽完
              </Typography>
            </Box>

            {minInterval < 30 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'error.lighter',
                  border: '1px solid',
                  borderColor: 'error.main',
                }}
              >
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  ⚠️ 最快连抽间隔只有 {minInterval} 分钟，注意身体健康！
                </Typography>
              </Box>
            )}

            {daytimeCount > nighttimeCount * 2 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'warning.lighter',
                  border: '1px solid',
                  borderColor: 'warning.main',
                }}
              >
                <Typography variant="body2" color="warning.main" fontWeight={600}>
                  ☀️ 你是白天型抽烟选手，{daytimePercent}% 的烟都在白天抽完了
                </Typography>
              </Box>
            )}

            {nighttimeCount > daytimeCount * 1.5 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.lighter',
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  🌙 夜猫子！你有 {nighttimePercent}% 的烟在晚上抽
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
