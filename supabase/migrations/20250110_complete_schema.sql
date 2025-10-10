-- =====================================================
-- 抽根应用 - 完整数据库 Schema
-- 创建时间: 2025-01-10
-- 设计原则: 简洁、不冗余、安全、易维护、可扩展
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. profiles 表（用户资料）
-- =====================================================
-- 说明：Supabase 的 auth.users 表存储认证信息
--       此表存储用户的额外资料和隐私设置

CREATE TABLE profiles (
  -- 主键，关联 auth.users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 2 AND length(username) <= 30),
  avatar_url TEXT,
  bio TEXT CHECK (length(bio) <= 200),

  -- Linux.do OAuth 字段
  linuxdo_id TEXT UNIQUE,
  linuxdo_username TEXT,
  linuxdo_trust_level INTEGER CHECK (linuxdo_trust_level BETWEEN 0 AND 4),

  -- 隐私设置
  privacy_show_in_leaderboard BOOLEAN NOT NULL DEFAULT true,  -- 是否参与排行榜
  privacy_allow_view_packs BOOLEAN NOT NULL DEFAULT false,    -- 是否允许别人查看口粮
  privacy_allow_encouragements BOOLEAN NOT NULL DEFAULT true, -- 是否允许别人打气

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_linuxdo_id ON profiles(linuxdo_id) WHERE linuxdo_id IS NOT NULL;
CREATE INDEX idx_profiles_leaderboard ON profiles(id) WHERE privacy_show_in_leaderboard = true;

-- 注释
COMMENT ON TABLE profiles IS '用户资料和隐私设置表';
COMMENT ON COLUMN profiles.privacy_show_in_leaderboard IS '是否在排行榜显示';
COMMENT ON COLUMN profiles.privacy_allow_view_packs IS '是否允许他人查看口粮';
COMMENT ON COLUMN profiles.privacy_allow_encouragements IS '是否允许他人打气';

-- =====================================================
-- 2. cigarette_packs 表（香烟包）
-- =====================================================

CREATE TABLE cigarette_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  name TEXT NOT NULL CHECK (length(name) > 0),
  brand TEXT,

  -- 数量和价格
  total_count INTEGER NOT NULL DEFAULT 20 CHECK (total_count > 0),
  remaining_count INTEGER NOT NULL CHECK (remaining_count >= 0 AND remaining_count <= total_count),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),

  -- 日期和照片
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_packs_user_id ON cigarette_packs(user_id);
CREATE INDEX idx_packs_user_active ON cigarette_packs(user_id, remaining_count)
  WHERE remaining_count > 0;

-- 注释
COMMENT ON TABLE cigarette_packs IS '香烟包记录表（口粮仓库）';
COMMENT ON COLUMN cigarette_packs.remaining_count IS '剩余支数，0 表示已抽完';

-- =====================================================
-- 3. smoking_records 表（抽烟记录）
-- =====================================================

CREATE TABLE smoking_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES cigarette_packs(id) ON DELETE CASCADE,

  -- 记录信息
  smoked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引（优化查询性能）
CREATE INDEX idx_records_user_smoked ON smoking_records(user_id, smoked_at DESC);
CREATE INDEX idx_records_pack_id ON smoking_records(pack_id);
CREATE INDEX idx_records_smoked_at ON smoking_records(smoked_at DESC);

-- 注释
COMMENT ON TABLE smoking_records IS '抽烟记录表';
COMMENT ON COLUMN smoking_records.cost IS '本次消费金额（记录时的单支价格快照）';

-- =====================================================
-- 4. encouragements 表（打气记录）
-- =====================================================

CREATE TABLE encouragements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 消息内容
  message TEXT NOT NULL CHECK (length(message) > 0 AND length(message) <= 500),

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 约束
  CONSTRAINT no_self_encourage CHECK (from_user_id != to_user_id)
);

-- 索引
CREATE INDEX idx_encouragements_to_user ON encouragements(to_user_id, created_at DESC);
CREATE INDEX idx_encouragements_from_user ON encouragements(from_user_id);

-- 注释
COMMENT ON TABLE encouragements IS '用户互相鼓励戒烟的记录表';

-- =====================================================
-- 5. 触发器函数
-- =====================================================

-- 5.1 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.2 自动减少香烟包库存
CREATE OR REPLACE FUNCTION decrease_pack_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 减少库存
  UPDATE cigarette_packs
  SET
    remaining_count = remaining_count - 1,
    updated_at = NOW()
  WHERE id = NEW.pack_id
    AND remaining_count > 0;

  -- 如果库存不足，抛出错误
  IF NOT FOUND THEN
    RAISE EXCEPTION '库存不足或香烟包不存在';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. 触发器
-- =====================================================

-- profiles 表
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- cigarette_packs 表
CREATE TRIGGER packs_updated_at
BEFORE UPDATE ON cigarette_packs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- smoking_records 表（自动减少库存）
CREATE TRIGGER record_decrease_pack
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION decrease_pack_count();

-- =====================================================
-- 7. Row Level Security (RLS) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cigarette_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE smoking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 7.1 profiles 表策略
-- -----------------------------------------------------

-- 所有人可以查看公开的用户资料
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
USING (true);

-- 用户注册时可以创建自己的 profile
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 用户可以删除自己的 profile
CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- -----------------------------------------------------
-- 7.2 cigarette_packs 表策略
-- -----------------------------------------------------

-- 用户可以查看自己的口粮
CREATE POLICY "Users can view own packs"
ON cigarette_packs FOR SELECT
USING (auth.uid() = user_id);

-- 允许查看设置为公开的用户口粮
CREATE POLICY "Public packs are viewable"
ON cigarette_packs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = cigarette_packs.user_id
    AND profiles.privacy_allow_view_packs = true
  )
);

-- 用户可以创建、更新、删除自己的口粮
CREATE POLICY "Users can manage own packs"
ON cigarette_packs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packs"
ON cigarette_packs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packs"
ON cigarette_packs FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- 7.3 smoking_records 表策略
-- -----------------------------------------------------

-- 用户可以查看自己的记录
CREATE POLICY "Users can view own records"
ON smoking_records FOR SELECT
USING (auth.uid() = user_id);

-- 用户可以创建自己的记录
CREATE POLICY "Users can create own records"
ON smoking_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的记录
CREATE POLICY "Users can delete own records"
ON smoking_records FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- 7.4 encouragements 表策略
-- -----------------------------------------------------

-- 所有人可以查看打气记录
CREATE POLICY "Everyone can view encouragements"
ON encouragements FOR SELECT
USING (true);

-- 用户可以给允许接收打气的用户发送打气
CREATE POLICY "Users can send encouragements"
ON encouragements FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = to_user_id
    AND profiles.privacy_allow_encouragements = true
  )
);

-- 用户可以删除自己发送的打气
CREATE POLICY "Users can delete own encouragements"
ON encouragements FOR DELETE
USING (auth.uid() = from_user_id);

-- 用户可以删除别人给自己的打气
CREATE POLICY "Users can delete received encouragements"
ON encouragements FOR DELETE
USING (auth.uid() = to_user_id);

-- =====================================================
-- 8. 数据库函数（用于复杂查询）
-- =====================================================

-- 8.1 获取排行榜（尊重隐私设置）
CREATE OR REPLACE FUNCTION get_leaderboard(
  period TEXT DEFAULT 'week',  -- 'day', 'week', 'month', 'all'
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  smoke_count BIGINT,
  total_cost DECIMAL(10, 2),
  rank BIGINT
) AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 计算时间范围
  CASE period
    WHEN 'day' THEN start_time := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN start_time := DATE_TRUNC('week', NOW());
    WHEN 'month' THEN start_time := DATE_TRUNC('month', NOW());
    ELSE start_time := '1970-01-01'::TIMESTAMP;
  END CASE;

  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.username,
    p.avatar_url,
    COUNT(sr.id) AS smoke_count,
    COALESCE(SUM(sr.cost), 0)::DECIMAL(10, 2) AS total_cost,
    ROW_NUMBER() OVER (ORDER BY COUNT(sr.id) DESC) AS rank
  FROM profiles p
  LEFT JOIN smoking_records sr ON p.id = sr.user_id
    AND sr.smoked_at >= start_time
  WHERE p.privacy_show_in_leaderboard = true  -- 尊重隐私设置
  GROUP BY p.id, p.username, p.avatar_url
  HAVING COUNT(sr.id) > 0
  ORDER BY smoke_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_leaderboard IS '获取排行榜，自动过滤隐藏用户';

-- 8.2 获取用户统计数据
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_smokes BIGINT,
  total_cost DECIMAL(10, 2),
  today_smokes BIGINT,
  today_cost DECIMAL(10, 2),
  week_smokes BIGINT,
  week_cost DECIMAL(10, 2),
  month_smokes BIGINT,
  month_cost DECIMAL(10, 2),
  avg_daily_smokes NUMERIC,
  first_smoke_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_smokes,
    COALESCE(SUM(cost), 0)::DECIMAL(10, 2) AS total_cost,

    COUNT(CASE WHEN smoked_at >= DATE_TRUNC('day', NOW()) THEN 1 END)::BIGINT AS today_smokes,
    COALESCE(SUM(CASE WHEN smoked_at >= DATE_TRUNC('day', NOW()) THEN cost END), 0)::DECIMAL(10, 2) AS today_cost,

    COUNT(CASE WHEN smoked_at >= DATE_TRUNC('week', NOW()) THEN 1 END)::BIGINT AS week_smokes,
    COALESCE(SUM(CASE WHEN smoked_at >= DATE_TRUNC('week', NOW()) THEN cost END), 0)::DECIMAL(10, 2) AS week_cost,

    COUNT(CASE WHEN smoked_at >= DATE_TRUNC('month', NOW()) THEN 1 END)::BIGINT AS month_smokes,
    COALESCE(SUM(CASE WHEN smoked_at >= DATE_TRUNC('month', NOW()) THEN cost END), 0)::DECIMAL(10, 2) AS month_cost,

    CASE
      WHEN MIN(smoked_at) IS NOT NULL THEN
        COUNT(*)::NUMERIC / GREATEST(1, EXTRACT(DAY FROM NOW() - MIN(smoked_at))::NUMERIC + 1)
      ELSE 0
    END AS avg_daily_smokes,

    MIN(DATE(smoked_at)) AS first_smoke_date
  FROM smoking_records
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_stats IS '获取用户的详细统计数据';

-- 8.3 获取品牌统计
CREATE OR REPLACE FUNCTION get_brand_stats(target_user_id UUID)
RETURNS TABLE (
  brand TEXT,
  pack_name TEXT,
  smoke_count BIGINT,
  total_cost DECIMAL(10, 2),
  last_smoked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(cp.brand, '未分类') AS brand,
    cp.name AS pack_name,
    COUNT(sr.id) AS smoke_count,
    COALESCE(SUM(sr.cost), 0)::DECIMAL(10, 2) AS total_cost,
    MAX(sr.smoked_at) AS last_smoked_at
  FROM cigarette_packs cp
  LEFT JOIN smoking_records sr ON cp.id = sr.pack_id
  WHERE cp.user_id = target_user_id
  GROUP BY cp.brand, cp.name
  HAVING COUNT(sr.id) > 0
  ORDER BY smoke_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_brand_stats IS '获取用户的品牌统计数据';

-- =====================================================
-- 9. 实用视图（可选）
-- =====================================================

-- 活跃口粮视图
CREATE VIEW active_packs AS
SELECT
  cp.*,
  (cp.price / cp.total_count)::DECIMAL(10, 2) AS price_per_stick,
  p.username
FROM cigarette_packs cp
JOIN profiles p ON cp.user_id = p.id
WHERE cp.remaining_count > 0;

COMMENT ON VIEW active_packs IS '活跃的香烟包（剩余数量 > 0）';

-- =====================================================
-- 10. 初始化和测试数据（可选）
-- =====================================================

-- 如果需要测试数据，取消下面的注释
/*
-- 创建测试用户的 profile（需要先在 auth.users 中创建用户）
-- INSERT INTO profiles (id, username)
-- VALUES ('user-uuid-here', 'test_user');
*/

-- =====================================================
-- 11. 性能优化建议
-- =====================================================

/*
如果数据量较大（百万级记录），考虑：

1. 对 smoking_records 按月分区：
   CREATE TABLE smoking_records_2025_01 PARTITION OF smoking_records
   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

2. 创建物化视图缓存统计：
   CREATE MATERIALIZED VIEW daily_stats AS
   SELECT user_id, DATE(smoked_at), COUNT(*), SUM(cost)
   FROM smoking_records
   GROUP BY user_id, DATE(smoked_at);

3. 定期归档历史数据（超过1年）

4. 使用连接池优化数据库连接
*/

-- =====================================================
-- 完成！
-- =====================================================

-- 查看所有表
-- \dt

-- 查看所有函数
-- \df

-- 查看所有策略
-- \dC
