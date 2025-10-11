'use client';

import { Container, Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import ProfileCard from '@/components/features/profile/ProfileCard';
import Achievements from '@/components/features/profile/Achievements';
import PrivacySettings from '@/components/features/profile/PrivacySettings';
import EditProfileDialog from '@/components/features/profile/EditProfileDialog';
import { updateProfile } from '@/lib/services/client/profile';
import type { Profile, AchievementWithStatus } from '@/types/database';

interface ProfileClientProps {
  initialData: {
    profile: Profile | null;
    stats: {
      today: { count: number; cost: number };
      week: { count: number; cost: number };
      month: { count: number; cost: number };
      total: { count: number; cost: number };
    };
    achievements: AchievementWithStatus[];
  };
}

export function ProfileClient({ initialData }: ProfileClientProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    const result = await updateProfile({
      username: updates.username,
      avatar_url: updates.avatar_url ?? undefined,
      bio: updates.bio ?? undefined,
    });

    if (result.success) {
      setEditDialogOpen(false);
      router.refresh();
    } else {
      alert(result.error || '更新失败');
    }
  };

  const handlePrivacyChange = async (settings: {
    privacy_show_in_leaderboard: boolean;
    privacy_allow_view_packs: boolean;
    privacy_allow_encouragements: boolean;
  }) => {
    // 隐私设置需要通过自定义的方式更新，因为 updateProfile 只接受基本字段
    const supabase = (await import('@/lib/supabase/client')).createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('未登录');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      alert(error.message || '更新失败');
    } else {
      router.refresh();
    }
  };

  if (!initialData.profile) {
    return null;
  }

  return (
    <>
      <TopNavbar user={initialData.profile} />

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
                id: initialData.profile.id,
                username: initialData.profile.username,
                avatar_url: initialData.profile.avatar_url,
                bio: initialData.profile.bio,
                status: initialData.profile.status,
                created_at: initialData.profile.created_at,
              }}
              onEdit={handleEditClick}
            />

            {/* 成就徽章 */}
            <Achievements achievements={initialData.achievements} />

            {/* 隐私设置 */}
            <PrivacySettings
              settings={{
                privacy_show_in_leaderboard: initialData.profile.privacy_show_in_leaderboard,
                privacy_allow_view_packs: initialData.profile.privacy_allow_view_packs,
                privacy_allow_encouragements: initialData.profile.privacy_allow_encouragements,
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
          id: initialData.profile.id,
          username: initialData.profile.username,
          avatar_url: initialData.profile.avatar_url,
          bio: initialData.profile.bio,
          status: initialData.profile.status,
        }}
        onUpdate={handleUpdateProfile}
      />
    </>
  );
}
