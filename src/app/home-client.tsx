'use client';

import { Container, Box, Button, Stack, Alert, Skeleton } from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import CigaretteSelector from '@/components/features/CigaretteSelector';
import { createSmokingRecord, deleteSmokingRecord } from '@/lib/services/client/smoking-records';
import type { Profile, CigarettePack } from '@/types/database';
import type { SmokingRecordWithPack } from '@/lib/services/smoking-records';

// 动态导入非关键组件（优先展示选择器和记录按钮）
const TodayStats = dynamic(() => import('@/components/features/TodayStats'), {
  loading: () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
    </Box>
  ),
});

const RecentRecords = dynamic(() => import('@/components/features/RecentRecords'), {
  loading: () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
      <Stack spacing={1}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  ),
});

interface HomeClientProps {
  initialData: {
    profile: Profile | null;
    activePacks: CigarettePack[];
    todayRecords: SmokingRecordWithPack[];
    stats: {
      today: { count: number; cost: number };
      week: { count: number; cost: number };
      month: { count: number; cost: number };
    };
  };
}

export function HomeClient({ initialData }: HomeClientProps) {
  const router = useRouter();
  const [selectedPackId, setSelectedPackId] = useState(initialData.activePacks[0]?.id || '');

  const handleRecordSmoke = async () => {
    if (!selectedPackId) {
      alert('请先选择香烟包');
      return;
    }

    const result = await createSmokingRecord(selectedPackId);

    if (result.success) {
      // 刷新页面（重新获取服务端数据）
      router.refresh();
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
      router.refresh();
    } else {
      alert(result.error || '删除失败');
    }
  };

  return (
    <>
      {/* 顶部导航 */}
      <TopNavbar user={initialData.profile} />

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
            {initialData.activePacks.length > 0 ? (
              <CigaretteSelector
                packs={initialData.activePacks}
                selectedPackId={selectedPackId}
                onPackChange={setSelectedPackId}
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
                  cursor: initialData.activePacks.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: initialData.activePacks.length > 0 ? 1 : 0.5,
                  '&:active': {
                    transform: initialData.activePacks.length > 0 ? 'scale(0.96)' : 'none',
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
              todayCount={initialData.stats.today.count}
              todayCost={initialData.stats.today.cost}
              weekCount={initialData.stats.week.count}
              monthCount={initialData.stats.month.count}
            />

            {/* 最近记录 */}
            <RecentRecords records={initialData.todayRecords} onDelete={handleRecordDelete} />
          </Stack>
        </Container>
      </Box>

      {/* 底部导航（仅移动端） */}
      <BottomNav />
    </>
  );
}
