'use client';

import {
  Box,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from '@mui/material';
import { SmokingRooms as SmokingIcon, LocalAtm as MoneyIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usePageTransition } from '@/components/layout/PageTransitionContext';

interface LeaderboardUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  smoke_count: number;
  total_cost: number;
  rank: number;
}

interface LeaderboardListProps {
  data: LeaderboardUser[];
  onUserClick?: (userId: string) => void;
}

export default function LeaderboardList({ data, onUserClick }: LeaderboardListProps) {
  const { suppressInitialMotion } = usePageTransition();
  if (data.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          暂无更多排名数据
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 500, mb: 2, display: 'block' }}
      >
        其他排名
      </Typography>

      <List sx={{ p: 0 }}>
        {data.map((user, index) => (
          <Paper
            key={user.user_id}
            component={motion.div}
            elevation={0}
            initial={suppressInitialMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: suppressInitialMotion ? 0 : index * 0.05 }}
            onClick={() => onUserClick?.(user.user_id)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              mb: 1.5,
              borderRadius: 2.5,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              },
              '&:last-child': { mb: 0 },
            }}
          >
            <ListItem sx={{ py: 2, px: 2.5 }}>
              {/* 排名 */}
              <Box
                sx={{
                  minWidth: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: user.rank <= 10 ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {user.rank}
                </Typography>
              </Box>

              {/* 头像 */}
              <ListItemAvatar>
                <Avatar
                  src={user.avatar_url || undefined}
                  alt={user.username}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                  }}
                >
                  {user.username[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>

              {/* 用户信息 */}
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight={600}>
                    {user.username}
                  </Typography>
                }
                secondary={
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mt: 0.5,
                    }}
                  >
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SmokingIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      <Typography variant="caption" fontWeight={600} color="primary.main">
                        {user.smoke_count} 支
                      </Typography>
                    </Box>
                    <Typography component="span" variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="caption" fontWeight={600} color="success.main">
                        ¥{user.total_cost.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
}
