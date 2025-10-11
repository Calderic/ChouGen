'use client';

import { Card, CardContent, Box, Avatar, Typography, IconButton, Stack } from '@mui/material';
import {
  Edit as EditIcon,
  SelfImprovement as QuittingIcon,
  Timeline as ControllingIcon,
  Visibility as ObservingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type UserStatus = 'quitting' | 'controlling' | 'observing';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  status: UserStatus;
  created_at: string;
}

interface ProfileCardProps {
  user: User;
  onEdit: () => void;
}

const statusConfig = {
  quitting: {
    label: '戒烟中',
    icon: QuittingIcon,
    color: '#10b981',
    bgColor: '#10b981',
  },
  controlling: {
    label: '控烟中',
    icon: ControllingIcon,
    color: '#f59e0b',
    bgColor: '#f59e0b',
  },
  observing: {
    label: '观望中',
    icon: ObservingIcon,
    color: '#6b7280',
    bgColor: '#6b7280',
  },
};

const getAvatarText = (username: string) => {
  return username.slice(0, 2).toUpperCase();
};

export default function ProfileCard({ user, onEdit }: ProfileCardProps) {
  const status = statusConfig[user.status];
  const StatusIcon = status.icon;
  const joinDate = format(new Date(user.created_at), 'yyyy年MM月dd日', { locale: zhCN });

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
        borderRadius: 3,
        position: 'relative',
      }}
    >
      {/* 编辑按钮 */}
      <IconButton
        onClick={onEdit}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            bgcolor: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
        size="small"
      >
        <EditIcon fontSize="small" />
      </IconButton>

      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          {/* 头像 + 状态徽章 */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.avatar_url || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              }}
            >
              {!user.avatar_url && getAvatarText(user.username)}
            </Avatar>

            {/* 状态徽章 */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: status.bgColor,
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <StatusIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
          </Box>

          {/* 用户信息 */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {user.username}
            </Typography>

            {/* 个性签名 */}
            {user.bio && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 400 }}>
                {user.bio}
              </Typography>
            )}

            {/* 状态和加入时间 */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  bgcolor: `${status.bgColor}15`,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: status.color }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: status.color }}>
                  {status.label}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {joinDate} 加入
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
