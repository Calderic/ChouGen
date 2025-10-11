'use client';

import { Snackbar, Alert, Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { UserAchievement } from '@/types/database';

interface AchievementNotificationProps {
  achievement: (UserAchievement & { name?: string; description?: string; icon?: string }) | null;
  onClose: () => void;
}

/**
 * 成就解锁通知组件
 * 显示动画效果和祝贺信息
 */
export default function AchievementNotification({
  achievement,
  onClose,
}: AchievementNotificationProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (achievement) {
      setOpen(true);
    }
  }, [achievement]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // 等待动画结束
  };

  if (!achievement) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Box>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: 4,
                  minWidth: 300,
                  maxWidth: 400,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  {/* 动画图标 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{
                      duration: 0.6,
                      times: [0, 0.6, 1],
                      ease: 'easeOut',
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '4rem',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {achievement.icon || '🏆'}
                    </Box>
                  </motion.div>

                  {/* 祝贺标题 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color="primary"
                      gutterBottom
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      成就解锁！
                    </Typography>
                  </motion.div>

                  {/* 成就名称 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {achievement.name || '未知成就'}
                    </Typography>
                  </motion.div>

                  {/* 成就描述 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description || '恭喜解锁新成就！'}
                    </Typography>
                  </motion.div>
                </Box>

                {/* 装饰性粒子效果 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    borderRadius: 4,
                  }}
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'rgba(255, 215, 0, 0.6)',
                      }}
                      animate={{
                        y: [0, -100],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Snackbar>
  );
}
