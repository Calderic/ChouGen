'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subscribeToAchievements, getAllAchievements } from '@/lib/services/achievements';
import AchievementNotification from '@/components/features/achievements/AchievementNotification';
import type { UserAchievement, Achievement } from '@/types/database';

interface AchievementContextType {
  latestAchievement:
    | (UserAchievement & { name?: string; description?: string; icon?: string })
    | null;
}

const AchievementContext = createContext<AchievementContextType>({
  latestAchievement: null,
});

export function useAchievements() {
  return useContext(AchievementContext);
}

interface AchievementProviderProps {
  children: ReactNode;
}

/**
 * 全局成就监听 Provider
 * 监听 Supabase Realtime 事件，当用户解锁新成就时自动显示通知
 */
export default function AchievementProvider({ children }: AchievementProviderProps) {
  const [latestAchievement, setLatestAchievement] = useState<
    (UserAchievement & { name?: string; description?: string; icon?: string }) | null
  >(null);
  const [achievementsMap, setAchievementsMap] = useState<Map<string, Achievement>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);

  // 获取当前用户 ID 和成就列表
  useEffect(() => {
    const supabase = createClient();

    // 获取用户 ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });

    // 获取所有成就定义并建立映射
    getAllAchievements().then(achievements => {
      const map = new Map<string, Achievement>();
      achievements.forEach(achievement => {
        map.set(achievement.id, achievement);
      });
      setAchievementsMap(map);
    });
  }, []);

  // 订阅成就解锁事件
  useEffect(() => {
    if (!userId) return;

    const cleanup = subscribeToAchievements(userId, newAchievement => {
      // 获取成就详情
      const achievementDetails = achievementsMap.get(newAchievement.achievement_id);

      if (achievementDetails) {
        // 合并数据并显示通知
        setLatestAchievement({
          ...newAchievement,
          name: achievementDetails.name,
          description: achievementDetails.description,
          icon: achievementDetails.icon || undefined,
        });

        // 可选: 使用浏览器通知 API
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('成就解锁！', {
            body: `${achievementDetails.name}: ${achievementDetails.description}`,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
          });
        }
      }
    });

    return cleanup;
  }, [userId, achievementsMap]);

  // 请求通知权限 (可选)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleCloseNotification = () => {
    setLatestAchievement(null);
  };

  return (
    <AchievementContext.Provider value={{ latestAchievement }}>
      {children}
      <AchievementNotification achievement={latestAchievement} onClose={handleCloseNotification} />
    </AchievementContext.Provider>
  );
}
