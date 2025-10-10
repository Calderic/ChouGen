'use client';

import { Box, Typography, Paper, Chip } from '@mui/material';
import { SmokingRooms as SmokingIcon, LocalAtm as MoneyIcon, TrendingUp as RankIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MyRankingProps {
  ranking: {
    rank: number;
    smoke_count: number;
    total_cost: number;
  } | null;
}

const FloatingCard = motion(Paper);

export default function MyRanking({ ranking }: MyRankingProps) {
  if (!ranking) {
    return null;
  }

  return (
    <FloatingCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: { xs: 88, md: 24 },
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: 'calc(100% - 32px)', sm: 480 },
        maxWidth: 480,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        borderRadius: 3,
        zIndex: 999,
        overflow: 'hidden',
      }}
    >
      {/* 顶部标签 */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 0.75,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <RankIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption" fontWeight={600}>
          我的排名
        </Typography>
      </Box>

      {/* 内容 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          py: 2,
          px: 2,
        }}
      >
        {/* 排名 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} gutterBottom>
            当前排名
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {ranking.rank}
          </Typography>
        </Box>

        {/* 分隔线 */}
        <Box sx={{ width: 1, height: 40, bgcolor: 'divider' }} />

        {/* 抽烟数 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} gutterBottom>
            抽烟数
          </Typography>
          <Chip
            icon={<SmokingIcon sx={{ fontSize: 16 }} />}
            label={`${ranking.smoke_count} 支`}
            sx={{
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'primary.main',
              },
            }}
          />
        </Box>

        {/* 分隔线 */}
        <Box sx={{ width: 1, height: 40, bgcolor: 'divider' }} />

        {/* 花费 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} gutterBottom>
            总花费
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body1" fontWeight={700} color="success.main">
              ¥{ranking.total_cost.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </FloatingCard>
  );
}
