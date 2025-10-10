'use client';

import {
  Dialog,
  DialogContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  SmokingRooms as SmokingIcon,
  Schedule as TimeIcon,
  Favorite as HeartIcon,
  VisibilityOff as HiddenIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface UserDetail {
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio?: string;

  // 统计数据
  today_smokes: number;
  last_smoke_time?: string;
  last_cigarette?: string;

  // 隐私设置
  privacy_show_stats: boolean; // 是否显示统计数据
  privacy_allow_encouragements: boolean; // 是否允许打气
}

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserDetail | null;
  onEncourage?: (userId: string) => void;
}

export default function UserDetailDialog({ open, onClose, user, onEncourage }: UserDetailDialogProps) {
  if (!user) {
    return null;
  }

  const lastSmokeTimeAgo = user.last_smoke_time
    ? formatDistanceToNow(new Date(user.last_smoke_time), {
        addSuffix: true,
        locale: zhCN,
      })
    : null;

  const handleEncourage = () => {
    if (onEncourage) {
      onEncourage(user.user_id);
    }
  };

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
      {/* 关闭按钮 */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        {/* 头部区域 */}
        <Box
          sx={{
            bgcolor: 'primary.lighter',
            pt: 5,
            pb: 3,
            px: 3,
            textAlign: 'center',
          }}
        >
          {/* 头像 */}
          <Avatar
            src={user.avatar_url || undefined}
            alt={user.username}
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
            {user.username[0]?.toUpperCase()}
          </Avatar>

          {/* 用户名 */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {user.username}
          </Typography>

          {/* 个人简介 */}
          {user.bio && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {user.bio}
            </Typography>
          )}
        </Box>

        {/* 统计信息 */}
        <Box sx={{ px: 3, py: 3 }}>
          {user.privacy_show_stats ? (
            <Stack spacing={2.5}>
              {/* 今日已抽 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SmokingIcon sx={{ color: 'primary.main' }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    今日已抽
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {user.today_smokes} 支
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* 上一支烟时间 */}
              {lastSmokeTimeAgo && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: 'info.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TimeIcon sx={{ color: 'info.main' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        上一支烟
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {lastSmokeTimeAgo}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />
                </>
              )}

              {/* 上一支抽的烟 */}
              {user.last_cigarette && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'warning.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SmokingIcon sx={{ color: 'warning.main' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      抽的烟
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {user.last_cigarette}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          ) : (
            // 隐私保护提示
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
              }}
            >
              <HiddenIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                该用户已隐藏详细信息
              </Typography>
            </Box>
          )}
        </Box>

        {/* 打气按钮 */}
        {user.privacy_allow_encouragements && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<HeartIcon />}
              onClick={handleEncourage}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              给TA打气
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
