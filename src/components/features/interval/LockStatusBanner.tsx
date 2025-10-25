'use client';

import { Box, Typography, LinearProgress, Button, Alert } from '@mui/material';
import { Lock as LockIcon, LockOpen as UnlockIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { LockStatus } from '@/types/database';

interface LockStatusBannerProps {
  lockStatus: LockStatus;
  onForceUnlock: () => void;
}

export default function LockStatusBanner({ lockStatus, onForceUnlock }: LockStatusBannerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // 计算剩余秒数
  useEffect(() => {
    if (!lockStatus.is_locked || !lockStatus.unlock_time) {
      setRemainingSeconds(0);
      return;
    }

    const calculateRemaining = () => {
      const unlockTime = new Date(lockStatus.unlock_time!);
      const now = new Date();
      const diff = Math.max(0, Math.floor((unlockTime.getTime() - now.getTime()) / 1000));
      setRemainingSeconds(diff);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [lockStatus.is_locked, lockStatus.unlock_time]);

  // 如果未锁定，不显示
  if (!lockStatus.is_locked) {
    return null;
  }

  // 格式化倒计时
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // 格式化上次抽烟时间
  const lastSmokeTimeStr = lockStatus.last_smoke_time
    ? formatDistanceToNow(new Date(lockStatus.last_smoke_time), {
        locale: zhCN,
        addSuffix: true,
      })
    : '未知';

  // 计算进度百分比
  const totalMinutes = lockStatus.remaining_minutes + remainingSeconds / 60;
  const progress =
    remainingSeconds > 0 ? ((totalMinutes - remainingSeconds / 60) / totalMinutes) * 100 : 100;

  return (
    <Alert
      severity="warning"
      icon={<LockIcon />}
      sx={{
        mb: 3,
        bgcolor: 'rgba(255, 152, 0, 0.1)',
        border: '2px solid',
        borderColor: 'warning.main',
        borderRadius: 3,
        '& .MuiAlert-icon': {
          color: 'warning.main',
        },
      }}
      action={
        <Button
          size="small"
          startIcon={<UnlockIcon />}
          onClick={onForceUnlock}
          sx={{
            color: 'error.main',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'error.lighter',
            },
          }}
        >
          强制解锁
        </Button>
      }
    >
      <Box>
        <Typography variant="body2" fontWeight={700} gutterBottom>
          🔒 电子锁已激活
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            上次抽烟：{lastSmokeTimeStr}
          </Typography>
          <Typography variant="caption" fontWeight={700} color="warning.main">
            解锁倒计时：{countdown}
          </Typography>
        </Box>

        {/* 进度条 */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(255, 152, 0, 0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'warning.main',
              borderRadius: 3,
            },
          }}
        />
      </Box>
    </Alert>
  );
}
