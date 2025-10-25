'use client';

import { Container, Box, Button, Stack, Alert, Skeleton } from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import CigaretteSelector from '@/components/features/CigaretteSelector';
import LockStatusBanner from '@/components/features/interval/LockStatusBanner';
import ForceUnlockDialog from '@/components/features/interval/ForceUnlockDialog';
import { createSmokingRecord, deleteSmokingRecord } from '@/lib/services/client/smoking-records';
import { checkLockStatus } from '@/lib/services/client/interval-control';
import type { Profile, CigarettePack, LockStatus } from '@/types/database';
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
  const [, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(initialData.activePacks[0]?.id || '');
  const [activePacks, setActivePacks] = useState<CigarettePack[]>(initialData.activePacks);
  const [records, setRecords] = useState<SmokingRecordWithPack[]>(initialData.todayRecords);
  const [stats, setStats] = useState(initialData.stats);
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null);
  const [forceUnlockDialogOpen, setForceUnlockDialogOpen] = useState(false);

  // 当服务端数据刷新回来时，同步到本地状态（避免状态漂移）
  useEffect(() => {
    setActivePacks(initialData.activePacks);
    setRecords(initialData.todayRecords);
    setStats(initialData.stats);
    // 确保选中的包仍然存在
    if (initialData.activePacks.length > 0) {
      const exists = initialData.activePacks.some(p => p.id === selectedPackId);
      if (!exists) {
        setSelectedPackId(initialData.activePacks[0].id);
      }
    } else {
      setSelectedPackId('');
    }
    // selectedPackId 是受控的，不需要作为依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // 加载和刷新锁定状态
  useEffect(() => {
    const loadLockStatus = async () => {
      if (!initialData.profile?.smoke_interval_enabled) {
        setLockStatus(null);
        return;
      }
      const result = await checkLockStatus();
      if (result.success && result.data) {
        setLockStatus(result.data);
      }
    };

    loadLockStatus();

    // 每30秒刷新一次锁定状态
    const interval = setInterval(loadLockStatus, 30000);
    return () => clearInterval(interval);
  }, [initialData.profile?.smoke_interval_enabled]);

  const handleRecordSmoke = async () => {
    if (!selectedPackId) {
      alert('请先选择香烟包');
      return;
    }

    // 检查锁定状态
    if (lockStatus?.is_locked) {
      setForceUnlockDialogOpen(true);
      return;
    }

    // 防止并发请求
    if (isSaving) {
      return;
    }

    const pack = activePacks.find(p => p.id === selectedPackId);
    if (!pack) {
      alert('所选口粮不存在');
      return;
    }
    if (pack.remaining_count <= 0) {
      alert('该口粮已抽完');
      return;
    }

    setIsSaving(true);

    // 计算单支成本（用于乐观更新）
    const costPerCigarette = pack.price / pack.total_count;

    // 乐观更新：先在 UI 中添加一条记录、更新统计、减少剩余支数
    const tempId = `temp-${Date.now()}`;
    const optimisticRecord: SmokingRecordWithPack = {
      id: tempId,
      user_id: initialData.profile!.id,
      pack_id: pack.id,
      smoked_at: new Date().toISOString(),
      cost: costPerCigarette,
      is_violation: false,
      violation_type: null,
      created_at: new Date().toISOString(),
      pack: { name: pack.name, brand: pack.brand },
    };

    setRecords(prev => [optimisticRecord, ...prev]);
    setStats(prev => ({
      ...prev,
      today: { count: prev.today.count + 1, cost: prev.today.cost + costPerCigarette },
    }));
    setActivePacks(prev =>
      prev.map(p => (p.id === pack.id ? { ...p, remaining_count: p.remaining_count - 1 } : p))
    );

    try {
      const result = await createSmokingRecord(selectedPackId);

      if (result.success && result.data) {
        // 用真实记录替换临时记录
        const realRecord: SmokingRecordWithPack = {
          ...result.data,
          pack: { name: pack.name, brand: pack.brand },
        };
        setRecords(prev => prev.map(r => (r.id === tempId ? realRecord : r)));

        // 后台刷新服务端数据，不阻塞当前 UI
        startTransition(() => {
          router.refresh();
        });
      } else {
        throw new Error(result.error || '记录失败');
      }
    } catch (e) {
      // 回滚乐观更新
      setRecords(prev => prev.filter(r => r.id !== tempId));
      setStats(prev => ({
        ...prev,
        today: {
          count: Math.max(0, prev.today.count - 1),
          cost: Math.max(0, prev.today.cost - costPerCigarette),
        },
      }));
      setActivePacks(prev =>
        prev.map(p => (p.id === pack.id ? { ...p, remaining_count: p.remaining_count + 1 } : p))
      );
      const error = e instanceof Error ? e.message : '记录失败';
      alert(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceUnlock = async () => {
    setForceUnlockDialogOpen(false);

    if (!selectedPackId || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await createSmokingRecord(selectedPackId, undefined, true); // forceUnlock = true

      if (result.success) {
        if (result.is_violation) {
          alert('⚠️ 已记录，但标记为违规');
        }
        // 刷新数据
        startTransition(() => {
          router.refresh();
        });
        // 重新加载锁定状态
        const lockResult = await checkLockStatus();
        if (lockResult.success && lockResult.data) {
          setLockStatus(lockResult.data);
        }
      } else {
        alert(result.error || '记录失败');
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : '记录失败';
      alert(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    // 找到要删除的记录（用于乐观回滚/更新）
    const target = records.find(r => r.id === id);
    if (!target) {
      return;
    }

    // 乐观更新：先从列表移除，并回退统计和口粮剩余
    setRecords(prev => prev.filter(r => r.id !== id));
    setStats(prev => ({
      ...prev,
      today: {
        count: Math.max(0, prev.today.count - 1),
        cost: Math.max(0, prev.today.cost - target.cost),
      },
    }));
    setActivePacks(prev =>
      prev.map(p =>
        p.id === target.pack_id ? { ...p, remaining_count: p.remaining_count + 1 } : p
      )
    );

    const result = await deleteSmokingRecord(id);

    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      // 回滚删除
      setRecords(prev => [target, ...prev]);
      setStats(prev => ({
        ...prev,
        today: { count: prev.today.count + 1, cost: prev.today.cost + target.cost },
      }));
      setActivePacks(prev =>
        prev.map(p =>
          p.id === target.pack_id
            ? { ...p, remaining_count: Math.max(0, p.remaining_count - 1) }
            : p
        )
      );
      alert(result.error || '删除失败');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* 锁定状态横幅 */}
        {lockStatus?.is_locked && (
          <LockStatusBanner
            lockStatus={lockStatus}
            onForceUnlock={() => setForceUnlockDialogOpen(true)}
          />
        )}

        {/* 香烟选择器 */}
        {initialData.activePacks.length > 0 ? (
          <CigaretteSelector
            packs={activePacks}
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
            onClick={isSaving || lockStatus?.is_locked ? undefined : handleRecordSmoke}
            sx={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: lockStatus?.is_locked
                ? 'rgba(255, 152, 0, 0.1)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: lockStatus?.is_locked
                ? '2px solid rgba(255, 152, 0, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor:
                activePacks.length > 0 && !isSaving && !lockStatus?.is_locked
                  ? 'pointer'
                  : 'not-allowed',
              opacity: activePacks.length > 0 && !lockStatus?.is_locked ? 1 : 0.5,
              '&:active': {
                transform:
                  activePacks.length > 0 && !lockStatus?.is_locked ? 'scale(0.96)' : 'none',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <AddIcon
                sx={{
                  fontSize: 56,
                  color: isSaving || lockStatus?.is_locked ? 'text.disabled' : 'primary.main',
                  mb: 1,
                }}
              />
              <Box sx={{ typography: 'body2', color: 'text.primary', fontWeight: 500 }}>
                {lockStatus?.is_locked ? `🔒 已锁定` : isSaving ? '记录中…' : '点击记录'}
              </Box>
              <Box sx={{ typography: 'caption', color: 'text.secondary', mt: 0.5 }}>
                {lockStatus?.is_locked
                  ? `${Math.ceil(lockStatus.remaining_minutes)}分钟后解锁`
                  : '抽一支'}
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
        <TodayStats
          todayCount={stats.today.count}
          todayCost={stats.today.cost}
          weekCount={stats.week.count}
          monthCount={stats.month.count}
        />

        {/* 最近记录 */}
        <RecentRecords records={records} onDelete={handleRecordDelete} />
      </Stack>

      {/* 强制解锁对话框 */}
      {lockStatus && (
        <ForceUnlockDialog
          open={forceUnlockDialogOpen}
          onClose={() => setForceUnlockDialogOpen(false)}
          onConfirm={handleForceUnlock}
          lockStatus={lockStatus}
          intervalMinutes={initialData.profile?.smoke_interval_minutes || 0}
        />
      )}
    </Container>
  );
}
