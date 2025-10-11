'use client';

import { Box, Typography, Card, CardContent, Tooltip } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { AchievementWithStatus } from '@/types/database';

interface AchievementsProps {
  achievements: AchievementWithStatus[];
}

// 成就颜色映射 (根据类别)
const categoryColorMap: Record<string, string> = {
  milestone: 'primary',
  streak: 'warning',
  cost: 'error',
  quit: 'success',
  special: 'secondary',
};

export default function Achievements({ achievements }: AchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

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
        {achievements.map((achievement, index) => {
          const color = categoryColorMap[achievement.category] || 'primary';

          return (
            <div key={`achievement-${achievement.id}-${index}`}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                sx={{ height: '100%' }}
              >
                <Tooltip
                  title={
                    achievement.unlocked && achievement.unlocked_at
                      ? `于 ${format(new Date(achievement.unlocked_at), 'yyyy年MM月dd日', { locale: zhCN })} 解锁`
                      : achievement.description
                  }
                  arrow
                >
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: achievement.unlocked
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: achievement.unlocked
                        ? '0 4px 24px rgba(0, 0, 0, 0.06)'
                        : '0 2px 8px rgba(0, 0, 0, 0.03)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: achievement.unlocked ? 1 : 0.6,
                      '&:hover': {
                        transform: achievement.unlocked ? 'translateY(-4px)' : 'none',
                        boxShadow: achievement.unlocked
                          ? '0 8px 32px rgba(0, 0, 0, 0.12)'
                          : '0 2px 8px rgba(0, 0, 0, 0.03)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      {/* 图标 (使用数据库中的 emoji) */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: achievement.unlocked
                            ? `${color}.lighter`
                            : 'rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 1.5,
                          fontSize: '2rem',
                          color: achievement.unlocked ? `${color}.main` : 'text.disabled',
                        }}
                      >
                        {achievement.unlocked ? achievement.icon : <LockIcon />}
                      </Box>

                      {/* 标题 */}
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={achievement.unlocked ? 'text.primary' : 'text.disabled'}
                        gutterBottom
                      >
                        {achievement.name}
                      </Typography>

                      {/* 描述 */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {achievement.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Box>
            </div>
          );
        })}
      </Box>
    </Box>
  );
}
