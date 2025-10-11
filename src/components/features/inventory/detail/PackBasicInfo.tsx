'use client';

import { Box, Typography, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import {
  SmokingRooms as SmokingIcon,
  LocalAtm as MoneyIcon,
  Schedule as TimeIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Pack {
  id: string;
  name: string;
  brand: string | null;
  remaining_count: number;
  total_count: number;
  price: number;
  purchase_date: string;
  finished_date?: string | null;
}

interface SmokingRecord {
  id: string;
  smoked_at: string;
  cost: number;
}

interface PackBasicInfoProps {
  pack: Pack;
  smokedCount: number;
  records: SmokingRecord[];
}

export default function PackBasicInfo({
  pack,
  smokedCount,
  records: _records,
}: PackBasicInfoProps) {
  const progress = (smokedCount / pack.total_count) * 100;
  const isFinished = pack.remaining_count === 0;

  // 计算时间跨度
  const purchaseDate = new Date(pack.purchase_date);
  const finishDate = pack.finished_date ? new Date(pack.finished_date) : new Date();
  const daysSpan = differenceInDays(finishDate, purchaseDate);
  const hoursSpan = differenceInHours(finishDate, purchaseDate);

  // 格式化日期
  const purchaseDateStr = format(purchaseDate, 'yyyy年MM月dd日', { locale: zhCN });
  const finishDateStr = pack.finished_date
    ? format(finishDate, 'yyyy年MM月dd日', { locale: zhCN })
    : '进行中';

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* 标题 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              {pack.brand && `${pack.brand} · `}
              {pack.name}
            </Typography>
            {isFinished && (
              <Chip
                icon={<CompleteIcon />}
                label="已抽完"
                size="small"
                sx={{
                  bgcolor: 'success.lighter',
                  color: 'success.main',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            ¥{pack.price.toFixed(2)} / {pack.total_count}支
          </Typography>
        </Box>

        {/* 进度条 */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: isFinished ? 'success.main' : 'primary.main',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              已抽 {smokedCount} / {pack.total_count} 支
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              {progress.toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        {/* 统计卡片网格 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {/* 购买日期 */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SmokingIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                购买时间
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {purchaseDateStr}
            </Typography>
          </Box>

          {/* 抽完日期 */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isFinished ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${isFinished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {isFinished ? (
                <CompleteIcon sx={{ fontSize: 18, color: 'success.main' }} />
              ) : (
                <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              )}
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {isFinished ? '抽完日期' : '当前状态'}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={600}
              color={isFinished ? 'success.main' : 'text.primary'}
            >
              {finishDateStr}
            </Typography>
          </Box>

          {/* 历时时间 */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TimeIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {isFinished ? '历时' : '已持续'}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {daysSpan > 0 ? `${daysSpan} 天` : `${hoursSpan} 小时`}
            </Typography>
          </Box>

          {/* 总花费 */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MoneyIcon sx={{ fontSize: 18, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                已花费
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600} color="success.main">
              ¥{(smokedCount * (pack.price / pack.total_count)).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
