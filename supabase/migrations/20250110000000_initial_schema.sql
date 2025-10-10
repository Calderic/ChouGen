-- 初始数据库 Schema
-- 创建时间: 2025-01-10

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- 1. users 表（用户表）
-- ======================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,  -- 邮箱（邮箱登录必填，OAuth 可选）
  username TEXT UNIQUE NOT NULL,  -- 用户名
  avatar_url TEXT,  -- 头像 URL

  -- Linux.do OAuth 字段
  linuxdo_id TEXT UNIQUE,  -- Linux.do 用户 ID
  linuxdo_username TEXT,  -- Linux.do 用户名
  linuxdo_trust_level INTEGER,  -- 信任等级 (0-4)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_linuxdo_id ON users(linuxdo_id);

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- 2. cigarette_inventory 表（口粮仓库）
-- ======================
CREATE TABLE cigarette_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- 香烟名称
  brand TEXT,  -- 品牌
  total_count INTEGER NOT NULL DEFAULT 20,  -- 总支数
  remaining_count INTEGER NOT NULL,  -- 剩余支数
  price DECIMAL(10, 2) NOT NULL,  -- 整盒价格
  price_per_stick DECIMAL(10, 2) GENERATED ALWAYS AS (price / total_count) STORED,  -- 单支价格
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- 购买日期
  photo_url TEXT,  -- 照片 URL
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),  -- 状态
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_inventory_user_id ON cigarette_inventory(user_id);
CREATE INDEX idx_inventory_status ON cigarette_inventory(status);
CREATE INDEX idx_inventory_user_status ON cigarette_inventory(user_id, status);

-- 自动更新状态触发器
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.remaining_count = 0 THEN
    NEW.status = 'finished';
  ELSIF NEW.remaining_count > 0 AND OLD.status = 'finished' THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_status
BEFORE UPDATE ON cigarette_inventory
FOR EACH ROW
EXECUTE FUNCTION update_inventory_status();

-- updated_at 触发器
CREATE TRIGGER trigger_inventory_updated_at
BEFORE UPDATE ON cigarette_inventory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- 3. smoking_records 表（抽烟记录）
-- ======================
CREATE TABLE smoking_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cigarette_id UUID NOT NULL REFERENCES cigarette_inventory(id) ON DELETE CASCADE,
  smoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 抽烟时间
  cost DECIMAL(10, 2) NOT NULL,  -- 本次消费
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_records_user_id ON smoking_records(user_id);
CREATE INDEX idx_records_cigarette_id ON smoking_records(cigarette_id);
CREATE INDEX idx_records_smoked_at ON smoking_records(smoked_at DESC);
CREATE INDEX idx_records_user_smoked_at ON smoking_records(user_id, smoked_at DESC);

-- 自动减少库存触发器
CREATE OR REPLACE FUNCTION decrease_inventory()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cigarette_inventory
  SET remaining_count = remaining_count - 1,
      updated_at = NOW()
  WHERE id = NEW.cigarette_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrease_inventory
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION decrease_inventory();

-- ======================
-- 4. encouragements 表（打气记录）
-- ======================
CREATE TABLE encouragements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,  -- 鼓励消息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 约束：不能给自己打气
  CONSTRAINT no_self_encourage CHECK (from_user_id != to_user_id)
);

-- 索引
CREATE INDEX idx_encouragements_to_user ON encouragements(to_user_id, created_at DESC);
CREATE INDEX idx_encouragements_from_user ON encouragements(from_user_id);

-- ======================
-- 5. Row Level Security (RLS) 策略
-- ======================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cigarette_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE smoking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;

-- users 表策略
CREATE POLICY "Users are viewable by everyone"
ON users FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- cigarette_inventory 表策略
CREATE POLICY "Users can view own inventory"
ON cigarette_inventory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
ON cigarette_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
ON cigarette_inventory FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
ON cigarette_inventory FOR DELETE
USING (auth.uid() = user_id);

-- smoking_records 表策略
CREATE POLICY "Users can view own records"
ON smoking_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
ON smoking_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
ON smoking_records FOR DELETE
USING (auth.uid() = user_id);

-- 允许聚合查询（用于排行榜）
CREATE POLICY "Aggregated records are viewable by everyone"
ON smoking_records FOR SELECT
USING (true);

-- encouragements 表策略
CREATE POLICY "Encouragements are viewable by everyone"
ON encouragements FOR SELECT
USING (true);

CREATE POLICY "Users can send encouragements"
ON encouragements FOR INSERT
WITH CHECK (auth.uid() = from_user_id AND from_user_id != to_user_id);

CREATE POLICY "Users can delete own encouragements"
ON encouragements FOR DELETE
USING (auth.uid() = from_user_id);

-- ======================
-- 6. 初始化数据（可选）
-- ======================

-- 这里可以添加一些测试数据
-- INSERT INTO users (username, email) VALUES ('test_user', 'test@example.com');
