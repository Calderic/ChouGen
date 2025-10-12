import { Container, Box, Stack, Skeleton } from '@mui/material';

/**
 * 首页骨架屏
 */
export function HomePageSkeleton() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }} role="status" aria-busy="true" aria-live="polite">
      <Stack spacing={4}>
        {/* 香烟选择器 */}
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />

        {/* 抽烟按钮区域 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 5,
          }}
        >
          <Skeleton variant="circular" width={180} height={180} />
          <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: 3 }} />
        </Box>

        {/* 今日统计 */}
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />

        {/* 最近记录 */}
        <Box>
          <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

/**
 * 排行榜页面骨架屏
 */
export function LeaderboardPageSkeleton() {
  return (
    <Container
      maxWidth="md"
      sx={{ py: 4, pb: { xs: 16, md: 4 } }}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Stack spacing={4}>
        {/* 标题 */}
        <Skeleton variant="text" width={160} height={40} sx={{ mx: 'auto', borderRadius: 1 }} />

        {/* Tab 切换 */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
        </Stack>

        {/* 前三名 */}
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="flex-end">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="rectangular" width={80} height={100} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Skeleton variant="rectangular" width={100} height={140} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="rectangular" width={80} height={100} sx={{ borderRadius: 2 }} />
          </Box>
        </Stack>

        {/* 排行榜列表 */}
        <Stack spacing={1}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

/**
 * 口粮仓库页面骨架屏
 */
export function InventoryPageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }} role="status" aria-busy="true" aria-live="polite">
      <Stack spacing={3}>
        {/* 标题和添加按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={140} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
        </Box>

        {/* Tab 切换 */}
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Stack>

        {/* 口粮卡片列表 */}
        <Stack spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

/**
 * 统计分析页面骨架屏
 */
export function StatisticsPageSkeleton() {
  return (
    <Container
      maxWidth="md"
      sx={{ py: 4, pb: { xs: 10, md: 4 } }}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Stack spacing={4}>
        {/* 数据概览 */}
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" sx={{ flex: 1, height: 120, borderRadius: 3 }} />
          <Skeleton variant="rectangular" sx={{ flex: 1, height: 120, borderRadius: 3 }} />
          <Skeleton variant="rectangular" sx={{ flex: 1, height: 120, borderRadius: 3 }} />
        </Stack>

        {/* Tab 切换 */}
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Stack>

        {/* 趋势图表 */}
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />

        {/* 时段分布 */}
        <Box>
          <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
        </Box>

        {/* 健康影响 */}
        <Box>
          <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
        </Box>
      </Stack>
    </Container>
  );
}

/**
 * 个人资料页面骨架屏
 */
export function ProfilePageSkeleton() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }} role="status" aria-busy="true" aria-live="polite">
      <Stack spacing={4} alignItems="center">
        {/* 头像 */}
        <Skeleton variant="circular" width={120} height={120} />

        {/* 用户信息 */}
        <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={150} height={24} />
        </Stack>

        {/* 统计卡片 */}
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Skeleton variant="rectangular" sx={{ flex: 1, height: 100, borderRadius: 3 }} />
          <Skeleton variant="rectangular" sx={{ flex: 1, height: 100, borderRadius: 3 }} />
        </Stack>

        {/* 设置列表 */}
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
        </Stack>
      </Stack>
    </Container>
  );
}
