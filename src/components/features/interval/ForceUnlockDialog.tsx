'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon, Lock as LockIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { LockStatus } from '@/types/database';

interface ForceUnlockDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lockStatus: LockStatus | null;
  intervalMinutes: number;
}

export default function ForceUnlockDialog({
  open,
  onClose,
  onConfirm,
  lockStatus,
  intervalMinutes,
}: ForceUnlockDialogProps) {
  if (!lockStatus) return null;

  const unlockTimeStr = lockStatus.unlock_time
    ? format(new Date(lockStatus.unlock_time), 'HH:mm:ss', { locale: zhCN })
    : '未知';

  const timePassed = lockStatus.last_smoke_time
    ? Math.floor((Date.now() - new Date(lockStatus.last_smoke_time).getTime()) / 60000)
    : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      {/* 标题区域 */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'error.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningIcon sx={{ color: 'error.main', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            强制解锁警告
          </Typography>
          <Typography variant="caption" color="text.secondary">
            此操作将被记录为违规
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* 警告信息 */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            您设置的抽烟间隔为 {intervalMinutes} 分钟
          </Typography>
          <Typography variant="body2">
            距离上次抽烟仅过去 <strong>{timePassed} 分钟</strong>
          </Typography>
        </Alert>

        {/* 详细信息 */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="body2" fontWeight={600}>
              锁定信息
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                预计解锁时间：
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {unlockTimeStr}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                当前时间：
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {format(new Date(), 'HH:mm:ss', { locale: zhCN })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                剩余等待：
              </Typography>
              <Typography variant="caption" fontWeight={600} color="warning.main">
                {lockStatus.remaining_minutes} 分钟
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 后果说明 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>强制解锁后：</strong>
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <Typography component="li" variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              本次抽烟将被标记为 <strong style={{ color: '#d32f2f' }}>违规记录</strong>
            </Typography>
            <Typography component="li" variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              违规记录将在统计页面中特殊显示
            </Typography>
            <Typography component="li" variant="caption" color="text.secondary">
              您的违规次数将增加
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
          取消
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ borderRadius: 2, flex: 1 }}
        >
          确认解锁
        </Button>
      </DialogActions>
    </Dialog>
  );
}
