/**
 * 时区工具库
 *
 * 本项目统一使用中国时区 (Asia/Shanghai, UTC+8) 进行时间计算
 *
 * 核心原则:
 * 1. 数据库存储: 始终使用 UTC ISO 8601 格式 (Supabase 标准)
 * 2. 时间计算: 始终基于中国时区 (服务端/客户端统一)
 * 3. 时间显示: 使用 date-fns 格式化为中文本地化显示
 *
 * 重要说明:
 * - JavaScript Date 对象本身就存储 UTC 时间戳
 * - new Date().toISOString() 总是返回 UTC 时间
 * - 我们只在显示和日期边界计算时需要考虑时区
 */

/**
 * 中国时区常量
 */
export const CHINA_TIMEZONE = 'Asia/Shanghai';
export const CHINA_OFFSET_HOURS = 8; // UTC+8
const CHINA_OFFSET_MS = CHINA_OFFSET_HOURS * 60 * 60 * 1000;

const CHINA_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: CHINA_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const CHINA_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: CHINA_TIMEZONE,
  weekday: 'short',
});

const CHINA_HOUR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: CHINA_TIMEZONE,
  hour: 'numeric',
  hour12: false,
});

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

type DateInput = Date | string;

interface ChinaDateParts {
  year: number;
  month: number;
  day: number;
}

interface ChinaTimeParts {
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function ensureDate(input: DateInput): Date {
  return typeof input === 'string' ? new Date(input) : input;
}

function getChinaDateParts(input: DateInput): ChinaDateParts {
  const date = ensureDate(input);
  const parts = CHINA_DATE_FORMATTER.formatToParts(date);
  const result: Partial<ChinaDateParts> = {};

  parts.forEach(part => {
    if (part.type === 'year') {
      result.year = Number(part.value);
    }
    if (part.type === 'month') {
      result.month = Number(part.value);
    }
    if (part.type === 'day') {
      result.day = Number(part.value);
    }
  });

  if (!result.year || !result.month || !result.day) {
    throw new Error('无法从输入时间解析中国时区日期');
  }

  return result as ChinaDateParts;
}

function buildChinaDate(parts: ChinaDateParts, time: ChinaTimeParts = {}): Date {
  const { year, month, day } = parts;
  const { hour = 0, minute = 0, second = 0, millisecond = 0 } = time;
  const utcFromLocal = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  return new Date(utcFromLocal - CHINA_OFFSET_MS);
}

function addChinaDays(date: Date, offset: number): Date {
  const clone = new Date(date.getTime());
  clone.setUTCDate(clone.getUTCDate() + offset);
  return clone;
}

function getChinaWeekdayIndex(input: DateInput): number {
  const weekday = CHINA_WEEKDAY_FORMATTER.format(ensureDate(input));
  return WEEKDAY_TO_INDEX[weekday] ?? 0;
}

function getChinaTodayStartDate(base: Date = new Date()): Date {
  const parts = getChinaDateParts(base);
  return buildChinaDate(parts);
}

function getChinaDayStartDate(input: DateInput): Date {
  const parts = getChinaDateParts(input);
  return buildChinaDate(parts);
}

function getChinaDayEndDate(input: DateInput): Date {
  const start = getChinaDayStartDate(input);
  return new Date(start.getTime() + MS_PER_DAY - 1);
}

/**
 * 获取当前时间的 Date 对象（用于直接存储到数据库）
 */
export function nowInChina(): Date {
  return new Date();
}

/**
 * 获取中国时区"今天"的开始时间 (00:00:00.000)
 */
export function getChinaTodayStart(): string {
  return getChinaTodayStartDate().toISOString();
}

/**
 * 获取中国时区"今天"的结束时间 (23:59:59.999)
 */
export function getChinaTodayEnd(): string {
  return getChinaDayEndDate(new Date()).toISOString();
}

/**
 * 获取中国时区 N 天前的开始时间
 */
export function getChinaDaysAgo(days: number): string {
  const todayStart = getChinaTodayStartDate();
  const target = addChinaDays(todayStart, -days);
  return target.toISOString();
}

/**
 * 获取中国时区"本周"的开始时间 (周一 00:00:00)
 */
export function getChinaWeekStart(): string {
  const weekdayIndex = getChinaWeekdayIndex(new Date());
  const todayStart = getChinaTodayStartDate();
  const weekStart = addChinaDays(todayStart, -weekdayIndex);
  return weekStart.toISOString();
}

/**
 * 获取中国时区"本月"的开始时间 (1号 00:00:00)
 */
export function getChinaMonthStart(): string {
  const { year, month } = getChinaDateParts(new Date());
  return buildChinaDate({ year, month, day: 1 }).toISOString();
}

/**
 * 获取中国时区某一天的开始时间
 */
export function getChinaDayStart(date: DateInput): string {
  return getChinaDayStartDate(date).toISOString();
}

/**
 * 获取中国时区某一天的结束时间
 */
export function getChinaDayEnd(date: DateInput): string {
  return getChinaDayEndDate(date).toISOString();
}

/**
 * 从 UTC ISO 字符串提取中国时区的日期 (YYYY-MM-DD)
 */
export function getChinaDateString(input: DateInput): string {
  const { year, month, day } = getChinaDateParts(input);
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * 从 UTC ISO 字符串提取中国时区的小时 (0-23)
 */
export function getChinaHour(input: DateInput): number {
  const hourStr = CHINA_HOUR_FORMATTER.format(ensureDate(input));
  return Number.parseInt(hourStr, 10);
}

/**
 * 判断某个时间是否在中国时区的"今天"
 */
export function isChinaToday(date: DateInput): boolean {
  const inputDateStr = getChinaDateString(date);
  const todayStr = getChinaDateString(new Date());
  return inputDateStr === todayStr;
}

/**
 * 计算两个时间之间相差的完整天数 (基于中国时区的日期边界)
 */
export function getDaysDifference(start: DateInput, end: DateInput): number {
  const startTime = getChinaDayStartDate(start).getTime();
  const endTime = getChinaDayStartDate(end).getTime();
  return Math.floor((endTime - startTime) / MS_PER_DAY);
}
