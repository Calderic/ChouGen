'use client';

import { Container, Box, Typography, Fab, Tabs, Tab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import ActivePacksList from '@/components/features/inventory/ActivePacksList';
import EmptyPacksList from '@/components/features/inventory/EmptyPacksList';
import AddPackDialog from '@/components/features/inventory/AddPackDialog';
import { createPack, deletePack } from '@/lib/services/client/cigarette-packs';
import type { Profile, CigarettePack } from '@/types/database';

interface InventoryClientProps {
  initialData: {
    profile: Profile | null;
    activePacks: CigarettePack[];
    emptyPacks: CigarettePack[];
  };
}

export function InventoryClient({ initialData }: InventoryClientProps) {
  const router = useRouter();
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

  const handleAddPack = async (packData: {
    name: string;
    brand: string;
    total_count: number;
    price: number;
    purchase_date: string;
  }) => {
    const result = await createPack(packData);

    if (result.success) {
      setAddDialogOpen(false);
      router.refresh();
    } else {
      alert(result.error || '添加失败');
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!confirm('确定要删除这个香烟包吗？')) {
      return;
    }

    const result = await deletePack(packId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || '删除失败');
    }
  };

  // 使用已抽完的包作为最近使用的包（用于快速添加）
  const recentPacks = initialData.emptyPacks.slice(0, 5);

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
              label={`当前口粮 (${initialData.activePacks.length})`}
              sx={{
                fontWeight: 600,
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <Tab
              label={`已抽完 (${initialData.emptyPacks.length})`}
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
              <ActivePacksList data={initialData.activePacks} onDelete={handleDeletePack} />
            ) : (
              <EmptyPacksList data={initialData.emptyPacks} onDelete={handleDeletePack} />
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
      </Box>

      <BottomNav />

      {/* 添加香烟弹窗 */}
      <AddPackDialog
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        onSubmit={handleAddPack}
        recentPacks={recentPacks}
      />
    </>
  );
}
