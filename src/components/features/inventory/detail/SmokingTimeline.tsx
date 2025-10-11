'use client';

import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { SmokingRooms as SmokingIcon, AccessTime as ClockIcon } from '@mui/icons-material';
import { format, parseISO, formatDistanceStrict } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SmokingRecord {
  id: string;
  smoked_at: string;
  cost: number;
}

interface Pack {
  name: string;
  brand: string | null;
  total_count: number;
}

interface SmokingTimelineProps {
  records: SmokingRecord[];
  pack: Pack;
}

export default function SmokingTimeline({ records, pack: _pack }: SmokingTimelineProps) {
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

  // 计算每支烟之间的时间间隔
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.smoked_at).getTime() - new Date(b.smoked_at).getTime()
  );

  return (
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
          抽烟时间轴
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
          记录每支烟的抽烟时间
        </Typography>

        {/* 时间轴 */}
        <Box sx={{ position: 'relative', pl: 4 }}>
          {/* 竖线 */}
          <Box
            sx={{
              position: 'absolute',
              left: 15,
              top: 8,
              bottom: 8,
              width: 2,
              bgcolor: 'primary.lighter',
            }}
          />

          {/* 记录列表 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {sortedRecords.map((record, index) => {
              const time = parseISO(record.smoked_at);
              const timeStr = format(time, 'HH:mm', { locale: zhCN });
              const dateStr = format(time, 'MM月dd日', { locale: zhCN });
              const weekdayStr = format(time, 'EEEE', { locale: zhCN });

              // 计算与上一支的时间间隔
              let interval = null;
              if (index > 0) {
                const prevTime = parseISO(sortedRecords[index - 1].smoked_at);
                const distance = formatDistanceStrict(time, prevTime, { locale: zhCN });
                interval = distance;
              }

              return (
                <Box key={record.id} sx={{ position: 'relative' }}>
                  {/* 圆点 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -31,
                      top: 4,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      border: '3px solid',
                      borderColor: 'background.paper',
                      boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
                    }}
                  />

                  {/* 内容卡片 */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmokingIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight={700}>
                          第 {index + 1} 支
                        </Typography>
                      </Box>

                      <Chip
                        label={timeStr}
                        size="small"
                        sx={{
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {dateStr} · {weekdayStr}
                      </Typography>

                      {interval && (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ClockIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                            <Typography variant="caption" color="warning.main" fontWeight={600}>
                              距上支 {interval}
                            </Typography>
                          </Box>
                        </>
                      )}

                      {index === 0 && (
                        <Chip
                          label="第一支"
                          size="small"
                          sx={{
                            height: 20,
                            bgcolor: 'success.lighter',
                            color: 'success.main',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                          }}
                        />
                      )}

                      {index === sortedRecords.length - 1 && sortedRecords.length > 1 && (
                        <Chip
                          label="最近一支"
                          size="small"
                          sx={{
                            height: 20,
                            bgcolor: 'info.lighter',
                            color: 'info.main',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
