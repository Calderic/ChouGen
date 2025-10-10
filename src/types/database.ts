// 数据库类型定义

export interface User {
  id: string;
  email: string | null;
  username: string;
  avatar_url: string | null;
  linuxdo_id: string | null;
  linuxdo_username: string | null;
  linuxdo_trust_level: number | null;
  created_at: string;
  updated_at: string;
}

export interface CigaretteInventory {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  total_count: number;
  remaining_count: number;
  price: number;
  price_per_stick: number;
  purchase_date: string;
  photo_url: string | null;
  status: 'active' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface SmokingRecord {
  id: string;
  user_id: string;
  cigarette_id: string;
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
