'use client';

import { Container, Stack, Paper, Typography, Box, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Lock as LockIcon } from '@mui/icons-material';
import ProfileCard from '@/components/features/profile/ProfileCard';
import Achievements from '@/components/features/profile/Achievements';
import PrivacySettings from '@/components/features/profile/PrivacySettings';
import { updateProfile, updatePrivacySettings } from '@/lib/services/client/profile';
import { getViolations } from '@/lib/services/client/interval-control';
import type { Profile, AchievementWithStatus } from '@/types/database';

// 动态导入编辑对话框（只在用户点击编辑按钮时加载）
const EditProfileDialog = dynamic(() => import('@/components/features/profile/EditProfileDialog'), {
  loading: () => null,
  ssr: false,
});

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
  const [violationsSummary, setViolationsSummary] = useState({
    total_count: 0,
    last_violation_time: null as string | null,
  });

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
    const result = await updatePrivacySettings(settings);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || '更新失败');
    }
  };

  // 加载违规摘要
  useEffect(() => {
    const loadViolations = async () => {
      const result = await getViolations(10);
      if (result.success && result.summary) {
        setViolationsSummary(result.summary);
      }
    };
    loadViolations();
  }, []);

  if (!initialData.profile) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: { xs: 10, md: 4 } }}>
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

        {/* 违规摘要卡片 */}
        {violationsSummary.total_count > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'rgba(255, 245, 245, 0.7)',
              border: '2px solid',
              borderColor: 'error.light',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ⚠️ 违规记录
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  总违规次数：<strong>{violationsSummary.total_count}</strong> 次
                </Typography>
                {violationsSummary.last_violation_time && (
                  <Typography variant="caption" color="text.secondary">
                    最近违规：
                    {format(new Date(violationsSummary.last_violation_time), 'yyyy-MM-dd HH:mm')}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={() => router.push('/statistics?tab=violations')}
              >
                查看详情
              </Button>
            </Box>
          </Paper>
        )}

        {/* 间隔控制入口 */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LockIcon />}
          onClick={() => router.push('/interval-control')}
          sx={{
            py: 1.5,
            borderRadius: 2,
            justifyContent: 'flex-start',
          }}
        >
          间隔控制设置
        </Button>
      </Stack>

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
    </Container>
  );
}
