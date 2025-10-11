'use client';

import { Container, Box, Typography, Fab, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from '@/components/layout/TopNavbar';
import BottomNav from '@/components/layout/BottomNav';
import ActivePacksList from '@/components/features/inventory/ActivePacksList';
import EmptyPacksList from '@/components/features/inventory/EmptyPacksList';
import AddPackDialog from '@/components/features/inventory/AddPackDialog';
import { getCurrentUserProfile } from '@/lib/services/profile';
import {
  getActivePacks,
  getEmptyPacks,
  createPack,
  deletePack,
  getRecentBrands,
} from '@/lib/services/cigarette-packs';
import type { Profile, CigarettePack } from '@/types/database';

export default function InventoryPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePacks, setActivePacks] = useState<CigarettePack[]>([]);
  const [emptyPacks, setEmptyPacks] = useState<CigarettePack[]>([]);
  const [recentPacks, setRecentPacks] = useState<CigarettePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 并行加载所有数据
      const [profileData, activePacksData, emptyPacksData] = await Promise.all([
        getCurrentUserProfile(),
        getActivePacks(),
        getEmptyPacks(),
      ]);

      if (!profileData) {
        setError('无法加载用户资料');
      } else {
        setProfile(profileData);
        setActivePacks(activePacksData);
        setEmptyPacks(emptyPacksData);
        // 使用已抽完的包作为最近使用的包（用于快速添加）
        setRecentPacks(emptyPacksData.slice(0, 5));
      }
    } catch (err) {
      setError('加载数据失败');
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

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
      // 刷新数据
      const activePacksData = await getActivePacks();
      setActivePacks(activePacksData);
      setAddDialogOpen(false);
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
      // 刷新数据
      const [activePacksData, emptyPacksData] = await Promise.all([
        getActivePacks(),
        getEmptyPacks(),
      ]);
      setActivePacks(activePacksData);
      setEmptyPacks(emptyPacksData);
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
              label={`当前口粮 (${activePacks.length})`}
              sx={{
                fontWeight: 600,
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <Tab
              label={`已抽完 (${emptyPacks.length})`}
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
              <ActivePacksList data={activePacks} onDelete={handleDeletePack} />
            ) : (
              <EmptyPacksList data={emptyPacks} onDelete={handleDeletePack} />
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
