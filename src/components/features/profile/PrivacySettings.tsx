'use client';

import { Box, Typography, Paper, Stack, Switch, Divider } from '@mui/material';
import {
  EmojiEvents as LeaderboardIcon,
  Inventory as PacksIcon,
  Favorite as EncouragementIcon,
} from '@mui/icons-material';

interface PrivacySettingsData {
  privacy_show_in_leaderboard: boolean;
  privacy_allow_view_packs: boolean;
  privacy_allow_encouragements: boolean;
}

interface PrivacySettingsProps {
  settings: PrivacySettingsData;
  onChange: (settings: PrivacySettingsData) => void;
}

export default function PrivacySettings({ settings, onChange }: PrivacySettingsProps) {
  const handleToggle = (key: keyof PrivacySettingsData) => {
    onChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const settingsConfig = [
    {
      key: 'privacy_show_in_leaderboard' as const,
      icon: <LeaderboardIcon />,
      title: '参与排行榜',
      description: '允许我的数据出现在排行榜中',
    },
    {
      key: 'privacy_allow_view_packs' as const,
      icon: <PacksIcon />,
      title: '公开口粮',
      description: '允许其他用户查看我的香烟包',
    },
    {
      key: 'privacy_allow_encouragements' as const,
      icon: <EncouragementIcon />,
      title: '接受打气',
      description: '允许其他用户给我发送鼓励消息',
    },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        隐私设置
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
        <Stack divider={<Divider />}>
          {settingsConfig.map(setting => (
            <Stack
              key={setting.key}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                p: 3,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              {/* 图标 */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'primary.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {setting.icon}
              </Box>

              {/* 文字 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {setting.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {setting.description}
                </Typography>
              </Box>

              {/* 开关 */}
              <Switch
                checked={settings[setting.key]}
                onChange={() => handleToggle(setting.key)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: 'primary.main',
                  },
                }}
              />
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* 提示信息 */}
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          💡 这些设置会影响其他用户与你的互动方式
        </Typography>
      </Box>
    </Box>
  );
}
