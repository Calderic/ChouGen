'use client';

import { Container, Box, Typography, Fab, Tabs, Tab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import ActivePacksList from '@/components/features/inventory/ActivePacksList';
import EmptyPacksList from '@/components/features/inventory/EmptyPacksList';
import AddPackDialog from '@/components/features/inventory/AddPackDialog';

// 模拟数据
const mockUser = {
  username: '测试用户',
  avatar_url: null,
};

const mockActivePacks = [
  {
    id: '1',
    name: '中华（软）',
    brand: '中华',
    remaining_count: 12,
    total_count: 20,
    price: 65.0,
    purchase_date: '2025-01-10',
    photo_url: null,
  },
  {
    id: '2',
    name: '玉溪',
    brand: '玉溪',
    remaining_count: 18,
    total_count: 20,
    price: 25.0,
    purchase_date: '2025-01-11',
    photo_url: null,
  },
];

const mockEmptyPacks = [
  {
    id: '3',
    name: '云烟（软珍品）',
    brand: '云烟',
    remaining_count: 0,
    total_count: 20,
    price: 20.0,
    purchase_date: '2025-01-05',
    photo_url: null,
  },
  {
    id: '4',
    name: '利群（软红）',
    brand: '利群',
    remaining_count: 0,
    total_count: 20,
    price: 15.0,
    purchase_date: '2025-01-03',
    photo_url: null,
  },
];

const PageContainer = motion(Box);

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };

  const handleAddPack = (packData: any) => {
    console.log('添加香烟:', packData);
    // TODO: 实现添加香烟功能
    setAddDialogOpen(false);
  };

  const handleDeletePack = (packId: string) => {
    console.log('删除香烟:', packId);
    // TODO: 实现删除香烟功能
  };

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
          pb: { xs: 10, md: 4 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* 标题 */}
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={{
              textAlign: 'center',
              mb: 3,
            }}
          >
            口粮仓库
          </Typography>

          {/* 标签页 */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
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
              label={`当前口粮 (${mockActivePacks.length})`}
              sx={{
                fontWeight: 600,
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <Tab
              label={`已抽完 (${mockEmptyPacks.length})`}
              sx={{
                fontWeight: 600,
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          </Tabs>

          {/* 内容区 */}
          <Box sx={{ minHeight: 400 }}>
            {tab === 0 ? (
              <ActivePacksList data={mockActivePacks} onDelete={handleDeletePack} />
            ) : (
              <EmptyPacksList data={mockEmptyPacks} onDelete={handleDeletePack} />
            )}
          </Box>
        </Container>

        {/* 添加按钮 */}
        <Fab
          color="primary"
          onClick={handleAddClick}
          sx={{
            position: 'fixed',
            bottom: { xs: 104, md: 32 },
            right: 32,
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
          }}
        >
          <AddIcon />
        </Fab>
      </PageContainer>

      <BottomNav />

      {/* 添加香烟弹窗 */}
      <AddPackDialog
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        onSubmit={handleAddPack}
        recentPacks={mockEmptyPacks}
      />
    </>
  );
}
