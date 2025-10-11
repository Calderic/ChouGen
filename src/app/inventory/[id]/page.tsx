'use client';

import {
  Container,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import PackBasicInfo from '@/components/features/inventory/detail/PackBasicInfo';
import SmokingChart from '@/components/features/inventory/detail/SmokingChart';
import SmokingTimeline from '@/components/features/inventory/detail/SmokingTimeline';
import PackAnalysis from '@/components/features/inventory/detail/PackAnalysis';
import { getCurrentUserProfile } from '@/lib/services/profile';
import { getPackById } from '@/lib/services/cigarette-packs';
import { getPackRecords } from '@/lib/services/smoking-records';
import type { Profile, CigarettePack, SmokingRecord } from '@/types/database';

export default function PackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const packId = params.id as string;
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pack, setPack] = useState<CigarettePack | null>(null);
  const [records, setRecords] = useState<SmokingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileData, packData, recordsData] = await Promise.all([
        getCurrentUserProfile(),
        getPackById(packId),
        getPackRecords(packId),
      ]);

      if (!profileData) {
        setError('无法加载用户资料');
      } else if (!packData) {
        setError('烟盒不存在');
      } else {
        setProfile(profileData);
        setPack(packData);
        setRecords(recordsData);
      }
    } catch (err) {
      setError('加载数据失败');
      console.error('加载烟盒详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
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
  if (error || !profile || !pack) {
    return (
      <>
        <TopNavbar user={profile} />
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

  // 计算统计数据
  const smokedCount = pack.total_count - pack.remaining_count;

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
          <PackBasicInfo pack={pack} smokedCount={smokedCount} records={records} />

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
            {tab === 0 && <SmokingChart records={records} />}
            {tab === 1 && <SmokingTimeline records={records} pack={pack} />}
            {tab === 2 && <PackAnalysis pack={pack} records={records} smokedCount={smokedCount} />}
          </Box>
        </Container>
      </Box>

      <BottomNav />
    </>
  );
}
