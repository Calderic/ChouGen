'use client';

import { Container, Box, Stack } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import ProfileCard from '@/components/features/profile/ProfileCard';
import Achievements from '@/components/features/profile/Achievements';
import PrivacySettings from '@/components/features/profile/PrivacySettings';
import EditProfileDialog from '@/components/features/profile/EditProfileDialog';

// 模拟数据
const mockUser = {
  id: 'user-1',
  username: '测试用户',
  avatar_url: null as string | null,
  bio: '每天少一支，健康多一点' as string | null,
  status: 'controlling' as 'quitting' | 'controlling' | 'observing',
  created_at: '2024-12-01T00:00:00Z',
};

const mockPrivacySettings = {
  privacy_show_in_leaderboard: true,
  privacy_allow_view_packs: false,
  privacy_allow_encouragements: true,
};

const mockAchievements = [
  { id: 'first_smoke', unlocked: true, unlocked_at: '2024-12-01T08:30:00Z' },
  { id: 'week_warrior', unlocked: true, unlocked_at: '2024-12-08T00:00:00Z' },
  { id: 'month_master', unlocked: true, unlocked_at: '2025-01-01T00:00:00Z' },
  { id: 'cost_conscious', unlocked: true, unlocked_at: '2025-01-05T14:20:00Z' },
  { id: 'quit_attempt', unlocked: false },
  { id: 'speed_demon', unlocked: true, unlocked_at: '2024-12-15T16:45:00Z' },
  { id: 'zen_master', unlocked: false },
];

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [privacySettings, setPrivacySettings] = useState(mockPrivacySettings);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleUpdateProfile = async (updates: Partial<typeof mockUser>) => {
    console.log('更新资料:', updates);
    // TODO: 调用 Supabase API 更新资料
    setUser({ ...user, ...updates });
  };

  const handlePrivacyChange = (settings: typeof mockPrivacySettings) => {
    console.log('更新隐私设置:', settings);
    // TODO: 调用 Supabase API 更新隐私设置
    setPrivacySettings(settings);
  };

  return (
    <>
      <TopNavbar user={user} />

      <Box
        component={motion.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        sx={{
          flexGrow: 1,
          pb: { xs: 10, md: 4 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Stack spacing={4}>
            {/* 个人信息卡片 */}
            <ProfileCard user={user} onEdit={handleEditClick} />

            {/* 成就徽章 */}
            <Achievements achievements={mockAchievements} />

            {/* 隐私设置 */}
            <PrivacySettings settings={privacySettings} onChange={handlePrivacyChange} />
          </Stack>
        </Container>
      </Box>

      <BottomNav />

      {/* 编辑资料弹窗 */}
      <EditProfileDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        user={user}
        onUpdate={handleUpdateProfile}
      />
    </>
  );
}
