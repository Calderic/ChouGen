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
