'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { label: '首页', value: '/', icon: <HomeIcon /> },
  { label: '口粮', value: '/inventory', icon: <InventoryIcon /> },
  { label: '统计', value: '/statistics', icon: <BarChartIcon /> },
  { label: '排行', value: '/leaderboard', icon: <TrophyIcon /> },
  { label: '我的', value: '/profile', icon: <PersonIcon /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState('/');

  useEffect(() => {
    // 匹配当前路径
    const current = navItems.find((item) => pathname === item.value);
    if (current) {
      setValue(current.value);
    }
  }, [pathname]);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(newValue);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        display: { xs: 'block', md: 'none' },
      }}
      elevation={0}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          bgcolor: 'transparent',
          height: 72,
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            sx={{
              minWidth: 0,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
