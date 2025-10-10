'use client';

import { Box, Avatar, Typography, Stack } from '@mui/material';
import { EmojiEvents as TrophyIcon, Whatshot as FireIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  smoke_count: number;
  total_cost: number;
  rank: number;
}

interface TopThreeProps {
  data: LeaderboardUser[];
  onUserClick?: (userId: string) => void;
}

const PodiumCard = motion(Box);

export default function TopThree({ data, onUserClick }: TopThreeProps) {
  if (data.length === 0) {
    return null;
  }

  // 按名次排序：第2名（左），第1名（中），第3名（右）
  const [first, second, third] = data;
  const displayOrder = second && third ? [second, first, third] : [first];

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // 金色
      case 2:
        return '#C0C0C0'; // 银色
      case 3:
        return '#CD7F32'; // 铜色
      default:
        return 'primary.main';
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 160;
      case 2:
        return 130;
      case 3:
        return 110;
      default:
        return 100;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'flex-end',
          mb: 4,
        }}
      >
        {displayOrder.map((user, index) => {
          const isFirst = user.rank === 1;
          const podiumHeight = getPodiumHeight(user.rank);

          return (
            <PodiumCard
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              onClick={() => onUserClick?.(user.user_id)}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              {/* 奖杯图标 */}
              {isFirst && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: -8,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                    },
                  }}
                >
                  <FireIcon sx={{ fontSize: 32, color: '#FF6B35' }} />
                </Box>
              )}

              {/* 头像 */}
              <Avatar
                src={user.avatar_url || undefined}
                alt={user.username}
                sx={{
                  width: isFirst ? 80 : 64,
                  height: isFirst ? 80 : 64,
                  mb: 1.5,
                  border: 4,
                  borderColor: getTrophyColor(user.rank),
                  boxShadow: `0 4px 16px ${getTrophyColor(user.rank)}40`,
                }}
              >
                {user.username[0]?.toUpperCase()}
              </Avatar>

              {/* 用户名 */}
              <Typography
                variant={isFirst ? 'body1' : 'body2'}
                fontWeight={600}
                sx={{
                  mb: 0.5,
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {user.username}
              </Typography>

              {/* 抽烟数量 */}
              <Typography
                variant={isFirst ? 'h6' : 'body2'}
                fontWeight={700}
                color="primary.main"
                sx={{ mb: 0.5 }}
              >
                {user.smoke_count} 支
              </Typography>

              {/* 花费 */}
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                ¥{user.total_cost.toFixed(2)}
              </Typography>

              {/* 领奖台 */}
              <Box
                sx={{
                  width: 90,
                  height: podiumHeight,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: getTrophyColor(user.rank),
                  },
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <TrophyIcon
                    sx={{
                      fontSize: isFirst ? 40 : 32,
                      color: getTrophyColor(user.rank),
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    variant={isFirst ? 'h4' : 'h5'}
                    fontWeight={700}
                    sx={{ color: getTrophyColor(user.rank) }}
                  >
                    {user.rank}
                  </Typography>
                </Box>
              </Box>
            </PodiumCard>
          );
        })}
      </Stack>
    </Box>
  );
}
