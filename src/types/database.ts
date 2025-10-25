// 数据库类型定义

export type UserStatus = 'quitting' | 'controlling' | 'observing';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  status: UserStatus;
  linuxdo_id: string | null;
  linuxdo_username: string | null;
  linuxdo_trust_level: number | null;
  privacy_show_in_leaderboard: boolean;
  privacy_allow_view_packs: boolean;
  privacy_allow_encouragements: boolean;
  smoke_interval_enabled: boolean;
  smoke_interval_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface CigarettePack {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  total_count: number;
  remaining_count: number;
  price: number;
  purchase_date: string;
  photo_url: string | null;
  finished_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmokingRecord {
  id: string;
  user_id: string;
  pack_id: string;
  smoked_at: string;
  cost: number;
  is_violation: boolean;
  violation_type: string | null;
  created_at: string;
}

export interface Encouragement {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
}

// 统计相关类型
export interface UserStats {
  total_smokes: number;
  total_cost: number;
  today_smokes: number;
  today_cost: number;
  week_smokes: number;
  week_cost: number;
  month_smokes: number;
  month_cost: number;
  avg_daily_smokes: number;
  first_smoke_date: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  smoke_count: number;
  total_cost: number;
  rank: number;
}

// 成就相关类型
export type AchievementCategory = 'milestone' | 'streak' | 'cost' | 'quit' | 'special';
export type RequirementType = 'count' | 'days' | 'cost' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  category: AchievementCategory;
  requirement_type: RequirementType;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  created_at: string;
}

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}

// 间隔控制相关类型
export interface ViolationLog {
  id: string;
  user_id: string;
  smoking_record_id: string;
  violation_type: string;
  expected_unlock_time: string;
  actual_smoke_time: string;
  interval_minutes: number;
  created_at: string;
}

export interface LockStatus {
  is_locked: boolean;
  last_smoke_time: string | null;
  unlock_time: string | null;
  remaining_minutes: number;
}

export interface IntervalSettings {
  enabled: boolean;
  minutes: number | null;
}

// 间隔预设常量
export const INTERVAL_PRESETS = [
  { label: '15分钟', minutes: 15 },
  { label: '30分钟', minutes: 30 },
  { label: '45分钟', minutes: 45 },
  { label: '1小时', minutes: 60 },
  { label: '2小时', minutes: 120 },
  { label: '3小时', minutes: 180 },
] as const;
