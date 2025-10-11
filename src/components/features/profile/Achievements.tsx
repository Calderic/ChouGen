'use client';

import { Box, Typography, Card, CardContent, Tooltip } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  Stars as StarsIcon,
  LocalFireDepartment as FireIcon,
  Favorite as HeartIcon,
  AttachMoney as MoneyIcon,
  FlashOn as FlashIcon,
  SelfImprovement as MeditateIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Achievement {
  id: string;
  unlocked: boolean;
  unlocked_at?: string;
}

interface AchievementsProps {
  achievements: Achievement[];
}

// 成就配置
const achievementConfig: Record<
  string,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
  first_smoke: {
    title: '首次记录',
    description: '记录第一支烟',
    icon: <StarsIcon />,
    color: 'primary',
  },
  week_warrior: {
    title: '一周战士',
    description: '连续记录一周',
    icon: <FireIcon />,
    color: 'warning',
  },
  month_master: {
    title: '月度大师',
    description: '连续记录一个月',
    icon: <TrophyIcon />,
    color: 'success',
  },
  cost_conscious: {
    title: '花费意识',
    description: '累计花费超过 ¥1000',
    icon: <MoneyIcon />,
    color: 'error',
  },
  quit_attempt: {
    title: '戒烟尝试',
    description: '单日抽烟少于 5 支',
    icon: <HeartIcon />,
    color: 'info',
  },
  speed_demon: {
    title: '闪电侠',
    description: '5 分钟内连抽两支',
    icon: <FlashIcon />,
    color: 'secondary',
  },
  zen_master: {
    title: '禅意大师',
    description: '成功戒烟 30 天',
    icon: <MeditateIcon />,
    color: 'success',
  },
};

export default function Achievements({ achievements }: AchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = Object.keys(achievementConfig).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          成就徽章
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {unlockedCount} / {totalCount}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {Object.entries(achievementConfig).map(([id, config], index) => {
          const achievement = achievements.find(a => a.id === id);
          const unlocked = achievement?.unlocked || false;
          const unlockedAt = achievement?.unlocked_at;

          return (
            <Tooltip
              key={id}
              title={
                unlocked && unlockedAt
                  ? `于 ${format(new Date(unlockedAt), 'yyyy年MM月dd日', { locale: zhCN })} 解锁`
                  : config.description
              }
              arrow
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: unlocked ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: unlocked
                      ? '0 4px 24px rgba(0, 0, 0, 0.06)'
                      : '0 2px 8px rgba(0, 0, 0, 0.03)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: unlocked ? 1 : 0.6,
                    '&:hover': {
                      transform: unlocked ? 'translateY(-4px)' : 'none',
                      boxShadow: unlocked
                        ? '0 8px 32px rgba(0, 0, 0, 0.12)'
                        : '0 2px 8px rgba(0, 0, 0, 0.03)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    {/* 图标 */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: unlocked ? `${config.color}.lighter` : 'rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 1.5,
                        color: unlocked ? `${config.color}.main` : 'text.disabled',
                      }}
                    >
                      {unlocked ? config.icon : <LockIcon />}
                    </Box>

                    {/* 标题 */}
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={unlocked ? 'text.primary' : 'text.disabled'}
                      gutterBottom
                    >
                      {config.title}
                    </Typography>

                    {/* 描述 */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {config.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
