'use client';

import { Container, Box, Typography, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import TopThree from '@/components/features/leaderboard/TopThree';
import LeaderboardList from '@/components/features/leaderboard/LeaderboardList';
import MyRanking from '@/components/features/leaderboard/MyRanking';
import UserDetailDialog from '@/components/features/leaderboard/UserDetailDialog';

// 模拟数据
const mockUser = {
  username: '测试用户',
  avatar_url: null,
};

const mockLeaderboardData = [
  {
    user_id: '1',
    username: '烟王老李',
    avatar_url: null,
    smoke_count: 156,
    total_cost: 780.5,
    rank: 1,
  },
  {
    user_id: '2',
    username: '戒烟失败者',
    avatar_url: null,
    smoke_count: 142,
    total_cost: 710.0,
    rank: 2,
  },
  {
    user_id: '3',
    username: '烟鬼小王',
    avatar_url: null,
    smoke_count: 128,
    total_cost: 640.0,
    rank: 3,
  },
  {
    user_id: '4',
    username: '烟民张三',
    avatar_url: null,
    smoke_count: 98,
    total_cost: 490.0,
    rank: 4,
  },
  {
    user_id: '5',
    username: '测试用户',
    avatar_url: null,
    smoke_count: 75,
    total_cost: 375.0,
    rank: 5,
  },
  // ... 更多数据
];

const mockMyRanking = {
  rank: 5,
  smoke_count: 75,
  total_cost: 375.0,
};

const mockUserDetail = {
  user_id: '1',
  username: '烟王老李',
  avatar_url: null,
  bio: '戒烟中...失败了156次',
  today_smokes: 8,
  last_smoke_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
  last_cigarette: '中华（软）',
  privacy_show_stats: true,
  privacy_allow_encouragements: true,
};

const PageContainer = motion(Box);

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('week');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePeriodChange = (_: React.SyntheticEvent, newValue: string) => {
    setPeriod(newValue);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleEncourage = (userId: string) => {
    console.log('给用户打气:', userId);
    // TODO: 实现打气功能
    setDialogOpen(false);
  };

  const topThree = mockLeaderboardData.slice(0, 3);
  const restOfList = mockLeaderboardData.slice(3, 30); // 4-30名

  return (
    <>
      <TopNavbar user={mockUser} />

      <PageContainer
        component="main"
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
        <MyRanking ranking={mockMyRanking} />
      </PageContainer>

      <BottomNav />

      {/* 用户详情弹窗 */}
      <UserDetailDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        user={mockUserDetail}
        onEncourage={handleEncourage}
      />
    </>
  );
}
