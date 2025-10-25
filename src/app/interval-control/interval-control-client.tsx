'use client';

import { Container, Box, Typography, IconButton } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import IntervalSettings from '@/components/features/interval/IntervalSettings';
import { updateIntervalSettings } from '@/lib/services/client/interval-control';
import type { IntervalSettings as IntervalSettingsType } from '@/types/database';

interface IntervalControlClientProps {
  initialSettings: IntervalSettingsType;
}

export function IntervalControlClient({ initialSettings }: IntervalControlClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSave = async (enabled: boolean, minutes: number | null) => {
    const result = await updateIntervalSettings(enabled, minutes);
    if (result.success) {
      router.refresh();
      alert('设置已保存');
    } else {
      alert(result.error || '保存失败');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: { xs: 10, md: 4 } }}>
      {/* 返回按钮 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          间隔控制
        </Typography>
      </Box>

      {/* 间隔设置组件 */}
      <IntervalSettings initialSettings={initialSettings} onSave={handleSave} />
    </Container>
  );
}
