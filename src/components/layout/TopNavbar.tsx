'use client';

import { AppBar, Toolbar, Box, Avatar, IconButton, Typography, Button, Stack } from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface TopNavbarProps {
  user?: {
    username: string;
    avatar_url?: string | null;
  } | null;
}

const navItems = [
  { label: '首页', value: '/', icon: <HomeIcon /> },
  { label: '排行榜', value: '/leaderboard', icon: <TrophyIcon /> },
  { label: '口粮仓库', value: '/inventory', icon: <InventoryIcon /> },
  { label: '统计分析', value: '/statistics', icon: <BarChartIcon /> },
];

export default function TopNavbar({ user }: TopNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 68, gap: 3 }}>
        {/* 左侧：Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: 0.5,
            }}
          >
            抽根
          </Typography>
        </Link>

        {/* 中间：PC端导航菜单 */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.value}
              startIcon={item.icon}
              onClick={() => router.push(item.value)}
              sx={{
                color: pathname === item.value ? 'primary.main' : 'text.secondary',
                bgcolor: pathname === item.value ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                fontWeight: pathname === item.value ? 600 : 500,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: pathname === item.value ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        {/* 右侧：用户头像 */}
        <IconButton
          onClick={() => router.push('/profile')}
          sx={{
            p: 0,
          }}
        >
          <Avatar
            src={user?.avatar_url || undefined}
            alt={user?.username}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
