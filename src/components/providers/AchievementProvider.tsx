'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    // 获取用户 ID 通过 Next API（避免在客户端直连 Supabase）
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data?.id) setUserId(data.id as string);
      })
      .catch(() => {});

    // 延迟加载成就定义（不阻塞首屏）
    const loadAchievements = () => {
      getAllAchievements().then(achievements => {
        const map = new Map<string, Achievement>();
        achievements.forEach(achievement => {
          map.set(achievement.id, achievement);
        });
        setAchievementsMap(map);
      });
    };

    if ('requestIdleCallback' in window) {
      // @ts-expect-error - requestIdleCallback is not in TypeScript's lib.dom.d.ts
      requestIdleCallback(loadAchievements);
    } else {
      setTimeout(loadAchievements, 2000);
    }
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
