'use client';

import { Container, Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import PackBasicInfo from '@/components/features/inventory/detail/PackBasicInfo';
import SmokingChart from '@/components/features/inventory/detail/SmokingChart';
import SmokingTimeline from '@/components/features/inventory/detail/SmokingTimeline';
import PackAnalysis from '@/components/features/inventory/detail/PackAnalysis';
import type { Profile, CigarettePack, SmokingRecord } from '@/types/database';

interface DetailClientProps {
  initialData: {
    profile: Profile | null;
    pack: CigarettePack;
    records: SmokingRecord[];
  };
}

export function DetailClient({ initialData }: DetailClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  // 计算统计数据
  const smokedCount = initialData.pack.total_count - initialData.pack.remaining_count;

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
            pack={initialData.pack}
            smokedCount={smokedCount}
            records={initialData.records}
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
            {tab === 0 && <SmokingChart records={initialData.records} />}
            {tab === 1 && <SmokingTimeline records={initialData.records} pack={initialData.pack} />}
            {tab === 2 && (
              <PackAnalysis
                pack={initialData.pack}
                records={initialData.records}
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
