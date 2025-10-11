'use client';

import { Container, Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import PackBasicInfo from '@/components/features/inventory/detail/PackBasicInfo';
import SmokingChart from '@/components/features/inventory/detail/SmokingChart';
import SmokingTimeline from '@/components/features/inventory/detail/SmokingTimeline';
import PackAnalysis from '@/components/features/inventory/detail/PackAnalysis';

// 模拟数据
const mockUser = {
  username: '测试用户',
  avatar_url: null,
};

const mockPackDetail = {
  id: '1',
  name: '中华（软）',
  brand: '中华',
  remaining_count: 12,
  total_count: 20,
  price: 65.0,
  purchase_date: '2025-01-10',
  finished_date: null, // 未抽完
  photo_url: null,
};

// 模拟抽烟记录（时间倒序）
const mockSmokingRecords = [
  { id: '1', smoked_at: '2025-01-11T14:30:00Z', cost: 3.25 },
  { id: '2', smoked_at: '2025-01-11T10:15:00Z', cost: 3.25 },
  { id: '3', smoked_at: '2025-01-11T08:00:00Z', cost: 3.25 },
  { id: '4', smoked_at: '2025-01-10T22:30:00Z', cost: 3.25 },
  { id: '5', smoked_at: '2025-01-10T19:45:00Z', cost: 3.25 },
  { id: '6', smoked_at: '2025-01-10T16:20:00Z', cost: 3.25 },
  { id: '7', smoked_at: '2025-01-10T13:10:00Z', cost: 3.25 },
  { id: '8', smoked_at: '2025-01-10T09:30:00Z', cost: 3.25 },
];

export default function PackDetailPage() {
  const router = useRouter();
  const _params = useParams();
  const [tab, setTab] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  // 计算统计数据
  const smokedCount = mockPackDetail.total_count - mockPackDetail.remaining_count;
  const _isFinished = mockPackDetail.remaining_count === 0;

  return (
    <>
      <TopNavbar user={mockUser} />

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
        }}
      >
        <Container maxWidth="md" sx={{ py: 3 }}>
          {/* 返回按钮 */}
          <Box sx={{ mb: 2 }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <BackIcon />
            </IconButton>
            <Typography
              component="span"
              variant="h6"
              fontWeight={700}
              sx={{ verticalAlign: 'middle' }}
            >
              烟盒详情
            </Typography>
          </Box>

          {/* 基本信息 */}
          <PackBasicInfo
            pack={mockPackDetail}
            smokedCount={smokedCount}
            records={mockSmokingRecords}
          />

          {/* 标签页 */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{
              mt: 3,
              mb: 3,
              '& .MuiTabs-indicator': {
                bgcolor: 'primary.main',
                height: 3,
                borderRadius: 1.5,
              },
            }}
          >
            <Tab
              label="抽烟趋势"
              sx={{
                fontWeight: 600,
                minWidth: 100,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <Tab
              label="时间轴"
              sx={{
                fontWeight: 600,
                minWidth: 100,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <Tab
              label="数据分析"
              sx={{
                fontWeight: 600,
                minWidth: 100,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          </Tabs>

          {/* 内容区 */}
          <Box sx={{ minHeight: 400 }}>
            {tab === 0 && <SmokingChart records={mockSmokingRecords} />}
            {tab === 1 && <SmokingTimeline records={mockSmokingRecords} pack={mockPackDetail} />}
            {tab === 2 && (
              <PackAnalysis
                pack={mockPackDetail}
                records={mockSmokingRecords}
                smokedCount={smokedCount}
              />
            )}
          </Box>
        </Container>
      </Box>

      <BottomNav />
    </>
  );
}
