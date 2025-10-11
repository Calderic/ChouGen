'use client';

import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import NavigationPrefetch from './NavigationPrefetch';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局组件 - 统一管理顶部导航和底部导航
 *
 * 特性：
 * - 布局组件只渲染一次，路由切换时保持不变
 * - 页面切换时有平滑的过渡动画
 * - 自动排除认证页面的导航显示
 * - 自动预加载主要路由
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // 认证页面不显示导航
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* 路由预加载 */}
      <NavigationPrefetch />

      {/* 顶部导航 - 不在认证页显示 */}
      {!isAuthPage && <TopNavbar />}

      {/* 主内容区 - 带页面切换动画 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: { xs: 10, md: 4 }, // 底部留空给移动端导航
          minHeight: isAuthPage ? '100vh' : 'auto',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname} // 路由变化时触发动画
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ height: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* 底部导航 - 仅移动端，不在认证页显示 */}
      {!isAuthPage && <BottomNav />}
    </Box>
  );
}
