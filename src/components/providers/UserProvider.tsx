'use client';

import { createContext, useContext, ReactNode } from 'react';

interface User {
  username: string;
  avatar_url?: string | null;
}

interface UserContextValue {
  user: User | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  user: User | null;
  children: ReactNode;
}

/**
 * 用户状态提供者
 * 在应用根部注入用户信息，避免每个页面重复传递
 */
export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

/**
 * 获取当前用户信息的 Hook
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
