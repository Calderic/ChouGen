'use client';

import { Container, Box, Typography, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import TopThree from '@/components/features/leaderboard/TopThree';
import LeaderboardList from '@/components/features/leaderboard/LeaderboardList';
import MyRanking from '@/components/features/leaderboard/MyRanking';
import UserDetailDialog from '@/components/features/leaderboard/UserDetailDialog';
import { getCurrentUserProfile } from '@/lib/services/profile';
import {
  getLeaderboard,
  getMyRanking,
  getUserDetail,
  sendEncouragement,
  type LeaderboardPeriod,
  type UserDetail,
} from '@/lib/services/leaderboard';
import type { Profile, LeaderboardEntry } from '@/types/database';

export default function LeaderboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [myRanking, setMyRanking] = useState<{
    rank: number | null;
    smoke_count: number;
    total_cost: number;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 切换时间段时重新加载
  useEffect(() => {
    if (profile) {
      loadLeaderboard();
    }
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const profileData = await getCurrentUserProfile();
      if (!profileData) {
        setError('无法加载用户资料');
      } else {
        setProfile(profileData);
        await loadLeaderboard();
      }
    } catch (err) {
      setError('加载数据失败');
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    const [leaderboard, ranking] = await Promise.all([
      getLeaderboard(period, 100),
      getMyRanking(period),
    ]);
    setLeaderboardData(leaderboard);
    setMyRanking(ranking);
  };

  const handlePeriodChange = (_: React.SyntheticEvent, newValue: string) => {
    setPeriod(newValue as LeaderboardPeriod);
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

  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3, 30); // 4-30名

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
            {error || '加载失败'}
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
        {myRanking && <MyRanking ranking={myRanking} />}
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
