'use client';

import { Box, Typography, Card, CardContent, Chip, Stack } from '@mui/material';
import { Warning as WarningIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import type { ViolationLog } from '@/types/database';

interface ViolationRecordListProps {
  violations: ViolationLog[];
}

const ViolationCard = motion(Card);

export default function ViolationRecordList({ violations }: ViolationRecordListProps) {
  if (violations.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2,
          }}
        >
          <Typography variant="h3">✅</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
          暂无违规记录
        </Typography>
        <Typography variant="caption" color="text.secondary">
          继续保持良好的自律习惯！
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <AnimatePresence>
        {violations.map((violation, index) => {
          const actualTime = new Date(violation.actual_smoke_time);
          const expectedTime = new Date(violation.expected_unlock_time);
          const timeDiff = Math.floor((expectedTime.getTime() - actualTime.getTime()) / 60000);

          return (
            <ViolationCard
              key={violation.id}
              elevation={0}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              sx={{
                bgcolor: 'rgba(255, 245, 245, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '2px solid',
                borderColor: 'error.light',
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* 违规标签 */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                }}
              >
                <WarningIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={700}>
                  违规记录
                </Typography>
              </Box>

              <CardContent sx={{ pt: 3 }}>
                {/* 违规时间 */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      违规时间
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(actualTime, 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(actualTime, { locale: zhCN, addSuffix: true })}
                    </Typography>
                  </Box>
                  <Chip
                    label={violation.violation_type === 'forced_unlock' ? '强制解锁' : '未知'}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </Box>

                {/* 违规详情 */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        设定间隔：
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {violation.interval_minutes} 分钟
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        应解锁时间：
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {format(expectedTime, 'HH:mm:ss', { locale: zhCN })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        实际抽烟时间：
                      </Typography>
                      <Typography variant="caption" fontWeight={600} color="error.main">
                        {format(actualTime, 'HH:mm:ss', { locale: zhCN })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 14, color: 'error.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          提前了：
                        </Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={700} color="error.main">
                        {timeDiff} 分钟
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </ViolationCard>
          );
        })}
      </AnimatePresence>
    </Stack>
  );
}
