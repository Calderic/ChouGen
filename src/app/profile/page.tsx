'use client';

import { Container, Box, Stack, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import ProfileCard from '@/components/features/profile/ProfileCard';
import Achievements from '@/components/features/profile/Achievements';
import PrivacySettings from '@/components/features/profile/PrivacySettings';
import EditProfileDialog from '@/components/features/profile/EditProfileDialog';
import {
  getCurrentUserProfile,
  updateUserProfile,
  updatePrivacySettings,
} from '@/lib/services/profile';
import { getUserAchievements } from '@/lib/services/achievements';
import type { Profile, AchievementWithStatus } from '@/types/database';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 加载用户资料和成就
  useEffect(() => {
    loadProfile();
    loadAchievements();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    const data = await getCurrentUserProfile();

    if (!data) {
      setError('无法加载用户资料');
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  const loadAchievements = async () => {
    const data = await getUserAchievements();
    setAchievements(data);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const result = await updateUserProfile({
      username: updates.username,
      avatar_url: updates.avatar_url,
      bio: updates.bio,
      status: updates.status,
    });

    if (result.success) {
      // 更新本地状态
      setProfile({ ...profile, ...updates });
      setEditDialogOpen(false);
    } else {
      alert(result.error || '更新失败');
    }
  };

  const handlePrivacyChange = async (settings: {
    privacy_show_in_leaderboard: boolean;
    privacy_allow_view_packs: boolean;
    privacy_allow_encouragements: boolean;
  }) => {
    if (!profile) return;

    const result = await updatePrivacySettings(settings);

    if (result.success) {
      // 更新本地状态
      setProfile({ ...profile, ...settings });
    } else {
      alert(result.error || '更新失败');
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <>
        <TopNavbar user={null} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress />
        </Box>
        <BottomNav />
      </>
    );
  }

  // 错误状态
  if (error || !profile) {
    return (
      <>
        <TopNavbar user={null} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error || '用户资料加载失败'}
          </Alert>
        </Box>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopNavbar user={profile} />

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
            <ProfileCard
              user={{
                id: profile.id,
                username: profile.username,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                status: profile.status,
                created_at: profile.created_at,
              }}
              onEdit={handleEditClick}
            />

            {/* 成就徽章 */}
            <Achievements achievements={achievements} />

            {/* 隐私设置 */}
            <PrivacySettings
              settings={{
                privacy_show_in_leaderboard: profile.privacy_show_in_leaderboard,
                privacy_allow_view_packs: profile.privacy_allow_view_packs,
                privacy_allow_encouragements: profile.privacy_allow_encouragements,
              }}
              onChange={handlePrivacyChange}
            />
          </Stack>
        </Container>
      </Box>

      <BottomNav />

      {/* 编辑资料弹窗 */}
      <EditProfileDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        user={{
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          status: profile.status,
        }}
        onUpdate={handleUpdateProfile}
      />
    </>
  );
}
