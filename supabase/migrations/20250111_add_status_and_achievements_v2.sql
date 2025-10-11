-- =====================================================
-- 增量更新: 添加用户状态和成就系统 (优化版)
-- 创建时间: 2025-01-11
-- 说明: 在已有 schema 基础上添加新功能
-- 优化: 更合理的时间判断 + 定时任务检查连续记录
-- =====================================================

-- =====================================================
-- 1. 为 profiles 表添加状态字段
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'observing'
CHECK (status IN ('quitting', 'controlling', 'observing'));

COMMENT ON COLUMN profiles.status IS '用户状态: quitting=戒烟中, controlling=控烟中, observing=观望中';

-- =====================================================
-- 2. 创建成就定义表
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'streak', 'cost', 'quit', 'special')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('count', 'days', 'cost', 'special')),
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE achievements IS '成就定义表';
COMMENT ON COLUMN achievements.category IS '成就类别: milestone=里程碑, streak=连续, cost=消费, quit=戒烟, special=特殊';

-- =====================================================
-- 3. 创建用户成就记录表
-- =====================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,

  CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_achievements IS '用户解锁的成就记录表';
COMMENT ON COLUMN user_achievements.progress IS '当前进度(可选,用于显示进度条)';

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- =====================================================
-- 4. 插入预定义成就数据
-- =====================================================

INSERT INTO achievements (id, name, description, icon, category, requirement_type, requirement_value) VALUES
  ('first_smoke', '首次记录', '记录第一支烟', '🚬', 'milestone', 'count', 1),
  ('week_warrior', '周战士', '连续记录7天', '📅', 'streak', 'days', 7),
  ('month_master', '月度大师', '连续记录30天', '🗓️', 'streak', 'days', 30),
  ('hundred_club', '百烟俱乐部', '累计记录100支烟', '💯', 'milestone', 'count', 100),
  ('cost_conscious', '花钱如流水', '总花费超过1000元', '💰', 'cost', 'cost', 1000),
  ('speed_demon', '闪电手', '单日记录10支以上', '⚡', 'special', 'count', 10),
  ('quit_attempt', '戒烟先锋', '连续7天零记录', '🏆', 'quit', 'days', 7),
  ('quit_master', '戒烟大师', '连续30天零记录', '👑', 'quit', 'days', 30),
  ('early_bird', '早起鸟儿', '凌晨4点~8点半记录', '🌅', 'special', 'special', 1),
  ('night_owl', '夜猫子', '晚上22点~凌晨4点记录', '🌙', 'special', 'special', 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. RLS 策略
-- =====================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- achievements 表策略: 所有人可查看
CREATE POLICY "Achievements are public"
ON achievements FOR SELECT
USING (true);

-- user_achievements 表策略: 用户可查看所有人的成就(社交展示)
CREATE POLICY "Public achievements are viewable"
ON user_achievements FOR SELECT
USING (true);

-- user_achievements 表策略: 只能通过系统创建(防止作弊)
CREATE POLICY "System can manage achievements"
ON user_achievements FOR INSERT
WITH CHECK (false);

CREATE POLICY "System can update achievements"
ON user_achievements FOR UPDATE
USING (false);

CREATE POLICY "System can delete achievements"
ON user_achievements FOR DELETE
USING (false);

-- =====================================================
-- 6. 成就自动解锁函数
-- =====================================================

-- 6.1 检查"首次记录"成就
CREATE OR REPLACE FUNCTION check_first_smoke_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM smoking_records WHERE user_id = NEW.user_id) = 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'first_smoke')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2 检查"百烟俱乐部"成就
CREATE OR REPLACE FUNCTION check_hundred_club_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM smoking_records WHERE user_id = NEW.user_id) >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'hundred_club')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.3 检查"花钱如流水"成就
CREATE OR REPLACE FUNCTION check_cost_achievement()
RETURNS TRIGGER AS $$
DECLARE
  total_cost_value DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(cost), 0) INTO total_cost_value
  FROM smoking_records
  WHERE user_id = NEW.user_id;

  IF total_cost_value >= 1000 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'cost_conscious')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.4 检查"闪电手"成就(单日10支以上)
CREATE OR REPLACE FUNCTION check_speed_demon_achievement()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM smoking_records
  WHERE user_id = NEW.user_id
    AND DATE(smoked_at) = DATE(NEW.smoked_at);

  IF today_count >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'speed_demon')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.5 检查"早起鸟儿"成就(凌晨4点~8点半)
CREATE OR REPLACE FUNCTION check_early_bird_achievement()
RETURNS TRIGGER AS $$
DECLARE
  smoke_hour INTEGER;
  smoke_minute INTEGER;
BEGIN
  smoke_hour := EXTRACT(HOUR FROM NEW.smoked_at);
  smoke_minute := EXTRACT(MINUTE FROM NEW.smoked_at);

  -- 4:00~8:30 之间
  IF (smoke_hour = 4 OR smoke_hour = 5 OR smoke_hour = 6 OR smoke_hour = 7) OR
     (smoke_hour = 8 AND smoke_minute <= 30) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'early_bird')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_early_bird_achievement IS '检查早起鸟儿成就: 凌晨4:00~8:30';

-- 6.6 检查"夜猫子"成就(晚上22点~凌晨4点)
CREATE OR REPLACE FUNCTION check_night_owl_achievement()
RETURNS TRIGGER AS $$
DECLARE
  smoke_hour INTEGER;
BEGIN
  smoke_hour := EXTRACT(HOUR FROM NEW.smoked_at);

  -- 22:00~23:59 或 0:00~3:59
  IF smoke_hour >= 22 OR smoke_hour < 4 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'night_owl')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_night_owl_achievement IS '检查夜猫子成就: 晚上22:00~凌晨4:00';

-- =====================================================
-- 7. 定时任务: 检查连续记录成就
-- =====================================================

-- 7.1 检查连续记录成就(周战士、月度大师)
CREATE OR REPLACE FUNCTION check_streak_achievements()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  consecutive_days INTEGER;
  last_record_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- 遍历所有用户
  FOR user_record IN
    SELECT DISTINCT user_id FROM smoking_records
  LOOP
    -- 计算连续记录天数
    WITH RECURSIVE date_series AS (
      -- 获取用户最后一次记录的日期
      SELECT
        DATE(MAX(smoked_at)) AS check_date,
        0 AS days_back
      FROM smoking_records
      WHERE user_id = user_record.user_id

      UNION ALL

      -- 递归检查前一天
      SELECT
        check_date - INTERVAL '1 day',
        days_back + 1
      FROM date_series
      WHERE days_back < 365
        AND EXISTS (
          SELECT 1 FROM smoking_records
          WHERE user_id = user_record.user_id
            AND DATE(smoked_at) = check_date - INTERVAL '1 day'
        )
    )
    SELECT COUNT(*) INTO consecutive_days
    FROM date_series;

    -- 解锁"周战士"成就(连续7天)
    IF consecutive_days >= 7 THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (user_record.user_id, 'week_warrior')
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;

    -- 解锁"月度大师"成就(连续30天)
    IF consecutive_days >= 30 THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (user_record.user_id, 'month_master')
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_streak_achievements IS '定时任务: 检查连续记录成就(建议每天运行)';

-- 7.2 检查戒烟成就(戒烟先锋、戒烟大师)
CREATE OR REPLACE FUNCTION check_quit_achievements()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  days_without_smoke INTEGER;
  last_smoke_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- 遍历所有用户
  FOR user_record IN
    SELECT DISTINCT user_id FROM smoking_records
  LOOP
    -- 获取最后一次抽烟日期
    SELECT DATE(MAX(smoked_at)) INTO last_smoke_date
    FROM smoking_records
    WHERE user_id = user_record.user_id;

    -- 计算距今天数
    days_without_smoke := current_date - last_smoke_date;

    -- 解锁"戒烟先锋"成就(连续7天零记录)
    IF days_without_smoke >= 7 THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (user_record.user_id, 'quit_attempt')
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;

    -- 解锁"戒烟大师"成就(连续30天零记录)
    IF days_without_smoke >= 30 THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (user_record.user_id, 'quit_master')
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_quit_achievements IS '定时任务: 检查戒烟成就(建议每天运行)';

-- =====================================================
-- 8. 触发器: 自动检查即时成就
-- =====================================================

CREATE OR REPLACE TRIGGER check_achievements_on_smoke
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION check_first_smoke_achievement();

CREATE OR REPLACE TRIGGER check_hundred_club_on_smoke
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION check_hundred_club_achievement();

CREATE OR REPLACE TRIGGER check_cost_on_smoke
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION check_cost_achievement();

CREATE OR REPLACE TRIGGER check_speed_demon_on_smoke
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION check_speed_demon_achievement();

CREATE OR REPLACE TRIGGER check_early_bird_on_smoke
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION check_early_bird_achievement();

CREATE OR REPLACE TRIGGER check_night_owl_on_smoke
AFTER INSERT ON smoking_records
FOR EACH ROW
EXECUTE FUNCTION check_night_owl_achievement();

-- =====================================================
-- 9. 辅助函数: 获取用户成就(带进度)
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_achievements_with_progress(target_user_id UUID)
RETURNS TABLE (
  achievement_id TEXT,
  name TEXT,
  description TEXT,
  icon TEXT,
  category TEXT,
  unlocked BOOLEAN,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER,
  requirement_value INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS achievement_id,
    a.name,
    a.description,
    a.icon,
    a.category,
    (ua.id IS NOT NULL) AS unlocked,
    ua.unlocked_at,
    COALESCE(ua.progress, 0) AS progress,
    a.requirement_value
  FROM achievements a
  LEFT JOIN user_achievements ua
    ON a.id = ua.achievement_id AND ua.user_id = target_user_id
  ORDER BY
    CASE WHEN ua.id IS NOT NULL THEN 0 ELSE 1 END,
    ua.unlocked_at DESC,
    a.category,
    a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_achievements_with_progress IS '获取用户所有成就及解锁状态';

-- =====================================================
-- 10. 创建定时任务调度(使用 pg_cron 扩展)
-- =====================================================

-- 注意: 需要在 Supabase Dashboard 中启用 pg_cron 扩展
-- 启用方式: Database > Extensions > 搜索 pg_cron > 启用

-- 创建扩展(如果未启用)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每天凌晨 1 点检查连续记录成就
SELECT cron.schedule(
  'check-streak-achievements',
  '0 1 * * *',
  'SELECT check_streak_achievements();'
);

-- 每天凌晨 2 点检查戒烟成就
SELECT cron.schedule(
  'check-quit-achievements',
  '0 2 * * *',
  'SELECT check_quit_achievements();'
);

COMMENT ON EXTENSION pg_cron IS '定时任务调度扩展';

-- =====================================================
-- 完成! 增量更新执行完毕
-- =====================================================

-- 验证新表
SELECT 'achievements 表' AS table_name, COUNT(*) AS row_count FROM achievements
UNION ALL
SELECT 'user_achievements 表' AS table_name, COUNT(*) AS row_count FROM user_achievements;

-- 验证新字段
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'status';

-- 验证定时任务
SELECT jobname, schedule, command
FROM cron.job
WHERE jobname LIKE '%achievement%';
