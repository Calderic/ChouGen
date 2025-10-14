/**
 * 时区工具库
 *
 * 本项目统一使用中国时区 (Asia/Shanghai, UTC+8) 进行时间计算
 *
 * 核心原则:
 * 1. 数据库存储: 始终使用 UTC ISO 8601 格式 (Supabase 标准)
 * 2. 时间计算: 始终基于中国时区 (服务端/客户端统一)
 * 3. 时间显示: 使用 date-fns 格式化为中文本地化显示
 */

/**
 * 中国时区常量
 */
export const CHINA_TIMEZONE = 'Asia/Shanghai';
export const CHINA_OFFSET = 8 * 60; // UTC+8 in minutes

/**
 * 获取当前中国时间
 * @returns Date 对象,表示当前中国时间
 */
export function nowInChina(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: CHINA_TIMEZONE }));
}

/**
 * 将任意时间转换为中国时区
 * @param date - Date 对象或 ISO 字符串
 * @returns Date 对象,表示中国时区的时间
 */
export function toChina(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: CHINA_TIMEZONE }));
}

/**
 * 获取中国时区"今天"的开始时间 (00:00:00.000)
 * @returns ISO 字符串,可直接用于数据库查询
 */
export function getChinaTodayStart(): string {
  const now = nowInChina();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return toUTC(start);
}

/**
 * 获取中国时区"今天"的结束时间 (23:59:59.999)
 * @returns ISO 字符串,可直接用于数据库查询
 */
export function getChinaTodayEnd(): string {
  const now = nowInChina();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return toUTC(end);
}

/**
 * 获取中国时区 N 天前的开始时间
 * @param days - 天数
 * @returns ISO 字符串
 */
export function getChinaDaysAgo(days: number): string {
  const now = nowInChina();
  const target = new Date(now);
  target.setDate(target.getDate() - days);
  target.setHours(0, 0, 0, 0);
  return toUTC(target);
}

/**
 * 获取中国时区"本周"的开始时间 (周一 00:00:00)
 * @returns ISO 字符串
 */
export function getChinaWeekStart(): string {
  const now = nowInChina();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day; // 调整到周一
  const start = new Date(now);
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return toUTC(start);
}

/**
 * 获取中国时区"本月"的开始时间 (1号 00:00:00)
 * @returns ISO 字符串
 */
export function getChinaMonthStart(): string {
  const now = nowInChina();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  return toUTC(start);
}

/**
 * 获取中国时区某一天的开始时间
 * @param date - Date 对象或 ISO 字符串
 * @returns ISO 字符串
 */
export function getChinaDayStart(date: Date | string): string {
  const chinaDate = toChina(date);
  const start = new Date(chinaDate);
  start.setHours(0, 0, 0, 0);
  return toUTC(start);
}

/**
 * 获取中国时区某一天的结束时间
 * @param date - Date 对象或 ISO 字符串
 * @returns ISO 字符串
 */
export function getChinaDayEnd(date: Date | string): string {
  const chinaDate = toChina(date);
  const end = new Date(chinaDate);
  end.setHours(23, 59, 59, 999);
  return toUTC(end);
}

/**
 * 将中国时间转换为 UTC ISO 字符串 (用于存储到数据库)
 * @param date - 中国时区的 Date 对象
 * @returns UTC ISO 字符串
 */
export function toUTC(date: Date): string {
  // 补偿回 UTC 时间
  const utc = new Date(date.getTime() - CHINA_OFFSET * 60 * 1000);
  return utc.toISOString();
}

/**
 * 从 UTC ISO 字符串提取中国时区的日期 (YYYY-MM-DD)
 * @param isoString - UTC ISO 字符串 (数据库返回)
 * @returns 中国时区的日期字符串 YYYY-MM-DD
 */
export function getChinaDateString(isoString: string): string {
  const chinaDate = toChina(isoString);
  const year = chinaDate.getFullYear();
  const month = String(chinaDate.getMonth() + 1).padStart(2, '0');
  const day = String(chinaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 从 UTC ISO 字符串提取中国时区的小时 (0-23)
 * @param isoString - UTC ISO 字符串
 * @returns 中国时区的小时数
 */
export function getChinaHour(isoString: string): number {
  return toChina(isoString).getHours();
}

/**
 * 判断某个时间是否在中国时区的"今天"
 * @param date - Date 对象或 ISO 字符串
 * @returns boolean
 */
export function isChinaToday(date: Date | string): boolean {
  const chinaDate = toChina(date);
  const today = nowInChina();

  return (
    chinaDate.getFullYear() === today.getFullYear() &&
    chinaDate.getMonth() === today.getMonth() &&
    chinaDate.getDate() === today.getDate()
  );
}

/**
 * 计算两个时间之间相差的完整天数 (基于中国时区的日期边界)
 * @param start - 开始时间
 * @param end - 结束时间
 * @returns 天数差
 */
export function getDaysDifference(start: Date | string, end: Date | string): number {
  const startDate = getChinaDateString(typeof start === 'string' ? start : start.toISOString());
  const endDate = getChinaDateString(typeof end === 'string' ? end : end.toISOString());

  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();

  return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24));
}
