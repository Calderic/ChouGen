'use client';

import { Box, Typography, Paper, Stack, LinearProgress, Grid } from '@mui/material';
import {
  Favorite as HeartIcon,
  AccountBalanceWallet as WalletIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface HealthData {
  totalCigarettes: number;
  totalDays: number;
  moneySaved: number;
  moneySpent: number;
  healthScore: number;
}

interface HealthImpactProps {
  data: HealthData;
}

export default function HealthImpact({ data }: HealthImpactProps) {
  // 计算一些有趣的数据
  const timeWasted = Math.floor((data.totalCigarettes * 5) / 60); // 每支烟约5分钟
  const lifeReducedDays = Math.floor(data.totalCigarettes * 0.0192); // 每支烟减少约11分钟（0.0192小时）

  // 健康分数颜色
  const getHealthColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const healthColor = getHealthColor(data.healthScore);

  // 有趣的健康提示
  const healthTips = [
    '🎯 戒烟3天后，呼吸会变得更顺畅',
    '💪 戒烟1周后，味觉和嗅觉开始恢复',
    '❤️ 戒烟1个月后，肺功能开始改善',
    '🌟 戒烟1年后，心脏病风险降低50%',
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        健康影响评估
      </Typography>

      <Stack spacing={2}>
        {/* 健康分数 */}
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
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: `${healthColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: healthColor,
              }}
            >
              <HeartIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                健康指数
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <LinearProgress
                  variant="determinate"
                  value={data.healthScore}
                  sx={{
                    flex: 1,
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: healthColor,
                    },
                  }}
                />
                <Typography variant="h6" fontWeight={700} sx={{ color: healthColor }}>
                  {data.healthScore}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {data.healthScore >= 70
              ? '健康状况良好，继续保持！'
              : data.healthScore >= 40
                ? '健康状况一般，建议减少抽烟'
                : '健康状况堪忧，强烈建议戒烟'}
          </Typography>
        </Paper>

        {/* 数据统计卡片 */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1.5,
                  color: '#ef4444',
                }}
              >
                <WalletIcon />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                ¥{data.moneySpent.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                累计花费
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1.5,
                  color: '#f59e0b',
                }}
              >
                <TimerIcon />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                {timeWasted}h
              </Typography>
              <Typography variant="caption" color="text.secondary">
                浪费时间
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* 健康警示 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'rgba(239, 68, 68, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 2px 12px rgba(239, 68, 68, 0.08)',
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#ef4444',
              }}
            >
              <WarningIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="#ef4444" gutterBottom>
                健康警示
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                已吸烟 {data.totalCigarettes} 支，约减少 {lifeReducedDays} 天寿命
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                💡 每一支烟都在影响你的健康，现在戒烟还不晚！
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* 戒烟小贴士 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'rgba(16, 185, 129, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 2px 12px rgba(16, 185, 129, 0.08)',
            borderRadius: 3,
          }}
        >
          <Typography variant="body2" fontWeight={600} color="#10b981" gutterBottom>
            💚 戒烟的好处
          </Typography>
          <Stack spacing={0.5}>
            {healthTips.map((tip, index) => (
              <Typography
                key={index}
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {tip}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
