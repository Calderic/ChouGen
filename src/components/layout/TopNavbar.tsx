'use client';

import { AppBar, Toolbar, Box, Avatar, IconButton, Typography } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopNavbarProps {
  user?: {
    username: string;
    avatar_url?: string | null;
  } | null;
}

export default function TopNavbar({ user }: TopNavbarProps) {
  const router = useRouter();

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
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 68 }}>
        {/* 左侧：用户头像 */}
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

        {/* 中间：Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          </Box>
        </Link>

        {/* 右侧：统计图标 */}
        <IconButton
          onClick={() => router.push('/statistics')}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <BarChartIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
