'use client';

import { Container, Box, Button, Stack } from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import CigaretteSelector from '@/components/features/CigaretteSelector';
import TodayStats from '@/components/features/TodayStats';
import RecentRecords from '@/components/features/RecentRecords';

// 模拟数据（后续替换为真实数据）
const mockUser = {
  username: '测试用户',
  avatar_url: null,
};

const mockPacks = [
  {
    id: '1',
    name: '中华（软）',
    brand: '中华',
    remaining_count: 12,
    total_count: 20,
    price: 65.0,
  },
  {
    id: '2',
    name: '玉溪',
    brand: '玉溪',
    remaining_count: 18,
    total_count: 20,
    price: 25.0,
  },
];

const mockRecords = [
  {
    id: '1',
    smoked_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    cost: 3.25,
    pack: { name: '中华（软）', brand: '中华' },
  },
  {
    id: '2',
    smoked_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    cost: 3.25,
    pack: { name: '中华（软）', brand: '中华' },
  },
  {
    id: '3',
    smoked_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4小时前
    cost: 1.25,
    pack: { name: '玉溪', brand: '玉溪' },
  },
];

const PageContainer = motion(Box);

export default function HomePage() {
  const router = useRouter();

  const handlePackChange = (packId: string) => {
    console.log('Selected pack:', packId);
    // TODO: 更新状态
  };

  const handleRecordDelete = (id: string) => {
    console.log('Delete record:', id);
    // TODO: 删除记录
  };

  return (
    <>
      {/* 顶部导航 */}
      <TopNavbar user={mockUser} />

      {/* 主内容区 */}
      <PageContainer
        component="main"
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
            <CigaretteSelector
              packs={mockPacks}
              selectedPackId={mockPacks[0].id}
              onPackChange={handlePackChange}
            />

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
                  cursor: 'pointer',
                  '&:active': {
                    transform: 'scale(0.96)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <AddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                  <Box sx={{ typography: 'body2', color: 'text.primary', fontWeight: 500 }}>
                    长按记录
                  </Box>
                  <Box sx={{ typography: 'caption', color: 'text.secondary', mt: 0.5 }}>
                    抽一支
                  </Box>
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
            <TodayStats todayCount={5} todayCost={16.25} weekCount={28} monthCount={142} />

            {/* 最近记录 */}
            <RecentRecords records={mockRecords} onDelete={handleRecordDelete} />
          </Stack>
        </Container>
      </PageContainer>

      {/* 底部导航（仅移动端） */}
      <BottomNav />
    </>
  );
}
