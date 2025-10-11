'use client';

import { Container, Box, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import CigaretteSelector from '@/components/features/CigaretteSelector';
import TodayStats from '@/components/features/TodayStats';
import RecentRecords from '@/components/features/RecentRecords';
import { getCurrentUserProfile } from '@/lib/services/profile';
import { getActivePacks } from '@/lib/services/cigarette-packs';
import {
  getTodayRecords,
  getUserStats,
  createSmokingRecord,
  deleteSmokingRecord,
} from '@/lib/services/smoking-records';
import type { Profile, CigarettePack } from '@/types/database';
import type { SmokingRecordWithPack } from '@/lib/services/smoking-records';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePacks, setActivePacks] = useState<CigarettePack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [todayRecords, setTodayRecords] = useState<SmokingRecordWithPack[]>([]);
  const [stats, setStats] = useState({
    today: { count: 0, cost: 0 },
    week: { count: 0, cost: 0 },
    month: { count: 0, cost: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 并行加载所有数据
      const [profileData, packsData, recordsData, statsData] = await Promise.all([
        getCurrentUserProfile(),
        getActivePacks(),
        getTodayRecords(),
        getUserStats(),
      ]);

      if (!profileData) {
        setError('无法加载用户资料');
      } else {
        setProfile(profileData);
        setActivePacks(packsData);
        setTodayRecords(recordsData);
        setStats(statsData);

        // 自动选择第一个香烟包
        if (packsData.length > 0 && !selectedPackId) {
          setSelectedPackId(packsData[0].id);
        }
      }
    } catch (err) {
      setError('加载数据失败');
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackChange = (packId: string) => {
    setSelectedPackId(packId);
  };

  const handleRecordSmoke = async () => {
    if (!selectedPackId) {
      alert('请先选择香烟包');
      return;
    }

    const result = await createSmokingRecord(selectedPackId);

    if (result.success) {
      // 刷新数据
      const [packsData, recordsData, statsData] = await Promise.all([
        getActivePacks(),
        getTodayRecords(),
        getUserStats(),
      ]);
      setActivePacks(packsData);
      setTodayRecords(recordsData);
      setStats(statsData);
    } else {
      alert(result.error || '记录失败');
    }
  };

  const handleRecordDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    const result = await deleteSmokingRecord(id);

    if (result.success) {
      // 刷新数据
      const [packsData, recordsData, statsData] = await Promise.all([
        getActivePacks(),
        getTodayRecords(),
        getUserStats(),
      ]);
      setActivePacks(packsData);
      setTodayRecords(recordsData);
      setStats(statsData);
    } else {
      alert(result.error || '删除失败');
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
            {error || '加载失败'}
          </Alert>
        </Box>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      {/* 顶部导航 */}
      <TopNavbar user={profile} />

      {/* 主内容区 */}
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
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Stack spacing={4}>
            {/* 香烟选择器 */}
            {activePacks.length > 0 ? (
              <CigaretteSelector
                packs={activePacks}
                selectedPackId={selectedPackId}
                onPackChange={handlePackChange}
              />
            ) : (
              <Alert severity="info">
                没有可用的香烟包，请先
                <Button size="small" onClick={() => router.push('/inventory')}>
                  添加口粮
                </Button>
              </Alert>
            )}

            {/* 长按抽烟按钮 */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                py: 5,
              }}
            >
              <Box
                onClick={handleRecordSmoke}
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: activePacks.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: activePacks.length > 0 ? 1 : 0.5,
                  '&:active': {
                    transform: activePacks.length > 0 ? 'scale(0.96)' : 'none',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <AddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                  <Box sx={{ typography: 'body2', color: 'text.primary', fontWeight: 500 }}>
                    点击记录
                  </Box>
                  <Box sx={{ typography: 'caption', color: 'text.secondary', mt: 0.5 }}>抽一支</Box>
                </Box>
              </Box>

              {/* 快捷按钮 */}
              <Button
                variant="outlined"
                startIcon={<InventoryIcon />}
                onClick={() => router.push('/inventory')}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  borderColor: 'divider',
                  color: 'text.primary',
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                管理口粮
              </Button>
            </Box>

            {/* 今日统计 */}
            <TodayStats
              todayCount={stats.today.count}
              todayCost={stats.today.cost}
              weekCount={stats.week.count}
              monthCount={stats.month.count}
            />

            {/* 最近记录 */}
            <RecentRecords records={todayRecords} onDelete={handleRecordDelete} />
          </Stack>
        </Container>
      </Box>

      {/* 底部导航（仅移动端） */}
      <BottomNav />
    </>
  );
}
