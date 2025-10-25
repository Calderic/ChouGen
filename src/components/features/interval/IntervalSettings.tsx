'use client';

import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Lock as LockIcon, Timer as TimerIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useState } from 'react';
import { INTERVAL_PRESETS } from '@/types/database';
import type { IntervalSettings as IntervalSettingsType } from '@/types/database';

interface IntervalSettingsProps {
  initialSettings: IntervalSettingsType;
  onSave: (enabled: boolean, minutes: number | null) => Promise<void>;
}

export default function IntervalSettings({ initialSettings, onSave }: IntervalSettingsProps) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(
    initialSettings.minutes && INTERVAL_PRESETS.find(p => p.minutes === initialSettings.minutes)
      ? initialSettings.minutes
      : 'custom'
  );
  const [customMinutes, setCustomMinutes] = useState(
    initialSettings.minutes && !INTERVAL_PRESETS.find(p => p.minutes === initialSettings.minutes)
      ? initialSettings.minutes
      : 30
  );
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>('minutes');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // 获取当前设置的分钟数
  const getCurrentMinutes = (): number => {
    if (selectedPreset === 'custom') {
      return customUnit === 'hours' ? customMinutes * 60 : customMinutes;
    }
    return selectedPreset;
  };

  // 计算下次可抽烟时间（示例）
  const getNextSmokeTime = (): string => {
    if (!enabled) return '未启用';
    const minutes = getCurrentMinutes();
    const nextTime = new Date(Date.now() + minutes * 60 * 1000);
    return nextTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggle = () => {
    if (enabled) {
      // 关闭时需要确认
      setConfirmDialogOpen(true);
    } else {
      setEnabled(true);
    }
  };

  const handleConfirmDisable = () => {
    setEnabled(false);
    setConfirmDialogOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const minutes = enabled ? getCurrentMinutes() : null;
      await onSave(enabled, minutes);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        间隔控制
      </Typography>

      <Paper
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* 启用开关 */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: enabled ? 'warning.lighter' : 'rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ color: enabled ? 'warning.main' : 'text.secondary' }} />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                启用电子锁
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {enabled ? '已启用，防止在间隔内记录抽烟' : '未启用'}
              </Typography>
            </Box>
          </Box>
          <Switch checked={enabled} onChange={handleToggle} />
        </Box>

        {/* 间隔设置 */}
        {enabled && (
          <Box sx={{ p: 3 }}>
            {/* 预设选项 */}
            <Typography variant="body2" fontWeight={600} gutterBottom>
              选择间隔时间：
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {INTERVAL_PRESETS.map(preset => (
                <Chip
                  key={preset.minutes}
                  label={preset.label}
                  onClick={() => setSelectedPreset(preset.minutes)}
                  color={selectedPreset === preset.minutes ? 'primary' : 'default'}
                  sx={{
                    fontWeight: selectedPreset === preset.minutes ? 600 : 400,
                    cursor: 'pointer',
                  }}
                />
              ))}
              <Chip
                label="自定义"
                onClick={() => setSelectedPreset('custom')}
                color={selectedPreset === 'custom' ? 'primary' : 'default'}
                sx={{
                  fontWeight: selectedPreset === 'custom' ? 600 : 400,
                  cursor: 'pointer',
                }}
              />
            </Box>

            {/* 自定义输入 */}
            {selectedPreset === 'custom' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  或自定义：
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(parseInt(e.target.value) || 0)}
                    inputProps={{
                      min: customUnit === 'minutes' ? 5 : 1,
                      max: customUnit === 'minutes' ? 1440 : 24,
                    }}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <FormControl size="small" sx={{ width: 120 }}>
                    <Select
                      value={customUnit}
                      onChange={e => setCustomUnit(e.target.value as 'minutes' | 'hours')}
                    >
                      <MenuItem value="minutes">分钟</MenuItem>
                      <MenuItem value="hours">小时</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  范围：{customUnit === 'minutes' ? '5-1440 分钟' : '1-24 小时'}
                </Typography>
              </Box>
            )}

            {/* 预览 */}
            <Alert
              severity="info"
              icon={<TimerIcon />}
              sx={{
                mb: 2,
                bgcolor: 'primary.lighter',
                '& .MuiAlert-icon': {
                  color: 'primary.main',
                },
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                示例：如果现在抽烟，下次可抽时间为 {getNextSmokeTime()}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* 保存按钮 */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </Box>
      </Paper>

      {/* 提示信息 */}
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          💡 电子锁启用后，在设定的间隔时间内将无法正常记录抽烟
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          ⚠️ 您仍可选择&ldquo;强制解锁&rdquo;，但会被记录为违规行为
        </Typography>
      </Box>

      {/* 关闭确认对话框 */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          确认关闭电子锁？
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            关闭电子锁后，您将可以随时记录抽烟，不再受间隔限制。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmDisable} color="warning" variant="contained">
            确认关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
