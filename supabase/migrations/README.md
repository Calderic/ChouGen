# 数据库 Migrations

## 文件说明

### 1. `20250110_complete_schema.sql` ✅ 已执行

完整的数据库初始化 schema,包含:

- profiles 表(用户资料)
- cigarette_packs 表(香烟包)
- smoking_records 表(抽烟记录)
- encouragements 表(打气记录)
- RLS 策略
- 数据库函数(统计、排行榜等)

### 2. `20250111_add_status_and_achievements_v2.sql` ⏳ 待执行 (推荐)

**优化版**增量更新,添加:

- profiles.status 字段(用户状态)
- achievements 表(成就定义)
- user_achievements 表(用户成就记录)
- **自动成就解锁触发器** (6个即时成就)
- **定时任务** (检查连续记录和戒烟成就)
- **优化的时间判断** (早起者/夜猫子)

---

## 执行方式

### 方式一: 使用 Supabase Dashboard (推荐)

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Database > Extensions**
4. **启用 `pg_cron` 扩展** (用于定时任务)
5. 进入 **SQL Editor**
6. 复制 `20250111_add_status_and_achievements_v2.sql` 的全部内容
7. 粘贴到编辑器中
8. 点击 **RUN** 执行

---

## 预定义成就列表

| ID             | 名称       | 描述                 | 类别      | 解锁条件      | 触发方式             |
| -------------- | ---------- | -------------------- | --------- | ------------- | -------------------- |
| first_smoke    | 首次记录   | 记录第一支烟         | milestone | 记录1支       | ✅ 自动触发器        |
| hundred_club   | 百烟俱乐部 | 累计记录100支烟      | milestone | 累计100支     | ✅ 自动触发器        |
| cost_conscious | 花钱如流水 | 总花费超过1000元     | cost      | 总花费≥1000元 | ✅ 自动触发器        |
| speed_demon    | 闪电手     | 单日记录10支以上     | special   | 单日10支+     | ✅ 自动触发器        |
| early_bird     | 早起鸟儿   | 凌晨4点~8点半记录    | special   | 4:00~8:30     | ✅ 自动触发器        |
| night_owl      | 夜猫子     | 晚上22点~凌晨4点记录 | special   | 22:00~4:00    | ✅ 自动触发器        |
| week_warrior   | 周战士     | 连续记录7天          | streak    | 连续7天       | ⏰ 定时任务(每天1点) |
| month_master   | 月度大师   | 连续记录30天         | streak    | 连续30天      | ⏰ 定时任务(每天1点) |
| quit_attempt   | 戒烟先锋   | 连续7天零记录        | quit      | 连续7天不抽   | ⏰ 定时任务(每天2点) |
| quit_master    | 戒烟大师   | 连续30天零记录       | quit      | 连续30天不抽  | ⏰ 定时任务(每天2点) |

---

## 时间规则说明

### 🌅 早起鸟儿

- **时间段**: 凌晨 4:00 ~ 早上 8:30
- **触发**: 在这个时间段内记录任意一支烟即可解锁
- **逻辑**: 涵盖早晨起床到上班前的时间

### 🌙 夜猫子

- **时间段**: 晚上 22:00 ~ 凌晨 4:00
- **触发**: 在这个时间段内记录任意一支烟即可解锁
- **逻辑**: 涵盖深夜到凌晨的时间

### 📅 连续记录成就

- **周战士**: 连续7天每天至少记录1支
- **月度大师**: 连续30天每天至少记录1支
- **检查时机**: 每天凌晨1点自动检查
- **逻辑**: 使用递归查询计算连续天数

### 🏆 戒烟成就

- **戒烟先锋**: 从最后一次抽烟起,连续7天零记录
- **戒烟大师**: 从最后一次抽烟起,连续30天零记录
- **检查时机**: 每天凌晨2点自动检查
- **逻辑**: 计算最后记录日期到今天的天数

---

## 定时任务说明

### 🔧 已自动配置的定时任务

| 任务名称                  | 执行时间    | 功能             | Cron 表达式 |
| ------------------------- | ----------- | ---------------- | ----------- |
| check-streak-achievements | 每天凌晨1点 | 检查连续记录成就 | `0 1 * * *` |
| check-quit-achievements   | 每天凌晨2点 | 检查戒烟成就     | `0 2 * * *` |

### 查看定时任务状态

```sql
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname LIKE '%achievement%';
```

### 手动触发定时任务(测试用)

```sql
-- 手动检查连续记录成就
SELECT check_streak_achievements();

-- 手动检查戒烟成就
SELECT check_quit_achievements();
```

---

## 执行后验证

执行以下 SQL 确认更新成功:

```sql
-- 1. 检查 profiles 表是否有 status 字段
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'status';

-- 2. 检查成就表数据
SELECT COUNT(*) FROM achievements;  -- 应该返回 10

-- 3. 检查触发器是否创建
SELECT COUNT(*) FROM information_schema.triggers
WHERE trigger_name LIKE '%achievement%';  -- 应该返回 6

-- 4. 检查定时任务是否创建
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname LIKE '%achievement%';  -- 应该返回 2

-- 5. 测试成就查询函数(替换为你的 user_id)
SELECT * FROM get_user_achievements_with_progress('your-user-id');
```

---

## 工作原理

### 📊 成就解锁流程

```
用户记录抽烟
    ↓
触发器自动检查即时成就
    ├─ 首次记录
    ├─ 百烟俱乐部
    ├─ 花钱如流水
    ├─ 闪电手
    ├─ 早起鸟儿
    └─ 夜猫子
    ↓
成就自动解锁并插入 user_achievements 表
```

```
定时任务每天运行
    ↓
凌晨1点: 检查所有用户的连续记录天数
    ├─ 连续7天 → 解锁"周战士"
    └─ 连续30天 → 解锁"月度大师"
    ↓
凌晨2点: 检查所有用户的戒烟天数
    ├─ 7天未抽 → 解锁"戒烟先锋"
    └─ 30天未抽 → 解锁"戒烟大师"
```

---

## 性能优化

### 索引设计

- ✅ `user_achievements.user_id` - 快速查询用户成就
- ✅ `user_achievements.unlocked_at` - 排序最近解锁
- ✅ `user_achievements.achievement_id` - 统计成就解锁率

### 触发器性能

- ✅ 使用 `ON CONFLICT DO NOTHING` 避免重复插入
- ✅ 使用 `SECURITY DEFINER` 绕过 RLS 提升性能
- ✅ 只在 INSERT 时触发,不影响 UPDATE/DELETE

### 定时任务性能

- ✅ 每天只运行1-2次,避免频繁查询
- ✅ 使用递归 CTE 高效计算连续天数
- ✅ 只处理有记录的用户

---

## 回滚 (如需要)

如果需要回滚此次更新:

```sql
-- 1. 删除定时任务
SELECT cron.unschedule('check-streak-achievements');
SELECT cron.unschedule('check-quit-achievements');

-- 2. 删除触发器
DROP TRIGGER IF EXISTS check_achievements_on_smoke ON smoking_records;
DROP TRIGGER IF EXISTS check_hundred_club_on_smoke ON smoking_records;
DROP TRIGGER IF EXISTS check_cost_on_smoke ON smoking_records;
DROP TRIGGER IF EXISTS check_speed_demon_on_smoke ON smoking_records;
DROP TRIGGER IF EXISTS check_early_bird_on_smoke ON smoking_records;
DROP TRIGGER IF EXISTS check_night_owl_on_smoke ON smoking_records;

-- 3. 删除函数
DROP FUNCTION IF EXISTS get_user_achievements_with_progress(UUID);
DROP FUNCTION IF EXISTS check_first_smoke_achievement();
DROP FUNCTION IF EXISTS check_hundred_club_achievement();
DROP FUNCTION IF EXISTS check_cost_achievement();
DROP FUNCTION IF EXISTS check_speed_demon_achievement();
DROP FUNCTION IF EXISTS check_early_bird_achievement();
DROP FUNCTION IF EXISTS check_night_owl_achievement();
DROP FUNCTION IF EXISTS check_streak_achievements();
DROP FUNCTION IF EXISTS check_quit_achievements();

-- 4. 删除表
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- 5. 删除字段
ALTER TABLE profiles DROP COLUMN IF EXISTS status;
```

---

## 常见问题

### Q: 为什么连续记录成就不是实时解锁?

A: 连续记录需要检查历史数据,计算成本较高。使用定时任务每天检查一次,既能满足需求,又不影响实时记录性能。

### Q: pg_cron 扩展如何启用?

A: 在 Supabase Dashboard → Database → Extensions 中搜索 `pg_cron` 并启用即可。

### Q: 定时任务失败怎么办?

A: 查看 `cron.job_run_details` 表查看执行日志:

```sql
SELECT * FROM cron.job_run_details
WHERE jobname LIKE '%achievement%'
ORDER BY start_time DESC
LIMIT 10;
```

### Q: 如何手动触发成就检查?

A: 直接调用函数:

```sql
SELECT check_streak_achievements();
SELECT check_quit_achievements();
```

---

## 注意事项

⚠️ **重要**:

1. 执行前请备份数据库
2. 建议在测试环境先执行
3. 确保 `pg_cron` 扩展已启用
4. `user_achievements` 表禁止前端直接插入,只能通过触发器或定时任务

📝 **提示**:

- 所有成就都有 RLS 策略保护
- 定时任务使用 `SECURITY DEFINER` 具有完整权限
- 成就解锁是幂等的,多次触发不会重复插入
