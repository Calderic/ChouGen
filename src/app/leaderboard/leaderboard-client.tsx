'use client';

import { Container, Box, Typography, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import TopThree from '@/components/features/leaderboard/TopThree';
import LeaderboardList from '@/components/features/leaderboard/LeaderboardList';
import MyRanking from '@/components/features/leaderboard/MyRanking';
import UserDetailDialog from '@/components/features/leaderboard/UserDetailDialog';
import {
  getUserDetail,
  sendEncouragement,
  type UserDetail,
} from '@/lib/services/client/leaderboard';
import type { Profile, LeaderboardEntry } from '@/types/database';

type LeaderboardPeriod = 'day' | 'week' | 'month' | 'all';

interface LeaderboardClientProps {
  initialData: {
    profile: Profile | null;
    leaderboard: LeaderboardEntry[];
    myRanking: {
      rank: number | null;
      smoke_count: number;
      total_cost: number;
    } | null;
    period: LeaderboardPeriod;
  };
}

export function LeaderboardClient({ initialData }: LeaderboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const period = initialData.period;

  const handlePeriodChange = (_: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newValue);
    router.push(`/leaderboard?${params.toString()}`);
  };

  const handleUserClick = async (userId: string) => {
    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      setSelectedUser(userDetail);
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEncourage = async (userId: string) => {
    const message = prompt('输入打气的话:');
    if (!message) return;

    const result = await sendEncouragement(userId, message);
    if (result.success) {
      alert('打气成功！');
      setDialogOpen(false);
    } else {
      alert(result.error || '打气失败');
    }
  };

  const topThree = initialData.leaderboard.slice(0, 3);
  const restOfList = initialData.leaderboard.slice(3, 30);

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
          pb: { xs: 16, md: 4 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* 标题和时间段切换 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{
                textAlign: 'center',
                mb: 3,
              }}
            >
              抽烟排行榜
            </Typography>

            <Tabs
              value={period}
              onChange={handlePeriodChange}
              centered
              sx={{
                mb: 3,
                '& .MuiTabs-indicator': {
                  bgcolor: 'primary.main',
                  height: 3,
                  borderRadius: 1.5,
                },
              }}
            >
              <Tab
                label="今日"
                value="day"
                sx={{
                  fontWeight: 600,
                  minWidth: 80,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              />
              <Tab
                label="本周"
                value="week"
                sx={{
                  fontWeight: 600,
                  minWidth: 80,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              />
              <Tab
                label="本月"
                value="month"
                sx={{
                  fontWeight: 600,
                  minWidth: 80,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              />
              <Tab
                label="总榜"
                value="all"
                sx={{
                  fontWeight: 600,
                  minWidth: 80,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              />
            </Tabs>
          </Box>

          {/* 前三名特殊展示 */}
          <TopThree data={topThree} onUserClick={handleUserClick} />

          {/* 4-30名列表 */}
          <LeaderboardList data={restOfList} onUserClick={handleUserClick} />
        </Container>

        {/* 我的排名（浮动在底部） */}
        {initialData.myRanking && <MyRanking ranking={initialData.myRanking} />}
      </Box>

      <BottomNav />

      {/* 用户详情弹窗 */}
      {selectedUser && (
        <UserDetailDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          user={selectedUser}
          onEncourage={handleEncourage}
        />
      )}
    </>
  );
}
