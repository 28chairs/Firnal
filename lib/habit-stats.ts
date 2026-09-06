import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import type { HabitCompletion } from '@/lib/types/habits';

export type HabitDayCell = {
  date: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export type HabitWeekDay = HabitDayCell & {
  weekdayLabel: string;
};

export function getCompletionDates(
  completions: HabitCompletion[],
  habitId: string,
): Set<string> {
  return new Set(
    completions.filter((row) => row.habitId === habitId).map((row) => row.date),
  );
}

export function getPreviousDateString(date: string, timezone: string): string {
  const anchor = toZonedTime(`${date}T12:00:00`, timezone);
  return formatInTimeZone(subDays(anchor, 1), timezone, 'yyyy-MM-dd');
}

/** Streaks-style: counts consecutive days ending today (if done) or yesterday (if today pending). */
export function calculateCurrentStreak(
  completionDates: Set<string>,
  today: string,
  timezone: string,
): number {
  let cursor = today;
  if (!completionDates.has(today)) {
    cursor = getPreviousDateString(today, timezone);
  }

  let streak = 0;
  while (completionDates.has(cursor)) {
    streak += 1;
    cursor = getPreviousDateString(cursor, timezone);
  }

  return streak;
}

export function getMonthCells(
  completionDates: Set<string>,
  today: string,
  timezone: string,
): HabitDayCell[] {
  const todayDate = toZonedTime(`${today}T12:00:00`, timezone);
  const monthStart = startOfMonth(todayDate);
  const monthEnd = endOfMonth(todayDate);

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
    const date = formatInTimeZone(day, timezone, 'yyyy-MM-dd');
    return {
      date,
      completed: completionDates.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

export function getWeekCells(
  completionDates: Set<string>,
  today: string,
  timezone: string,
): HabitWeekDay[] {
  const todayDate = toZonedTime(`${today}T12:00:00`, timezone);
  const start = subDays(todayDate, 6);

  return eachDayOfInterval({ start, end: todayDate }).map((day) => {
    const date = formatInTimeZone(day, timezone, 'yyyy-MM-dd');
    return {
      date,
      completed: completionDates.has(date),
      isToday: date === today,
      isFuture: date > today,
      weekdayLabel: format(day, 'EEEEE'),
    };
  });
}

export function getMonthCompletionRate(cells: HabitDayCell[]): number {
  const eligible = cells.filter((cell) => !cell.isFuture);
  if (eligible.length === 0) return 0;
  const done = eligible.filter((cell) => cell.completed).length;
  return Math.round((done / eligible.length) * 100);
}

export function getMonthLabel(today: string, timezone: string): string {
  return formatInTimeZone(toZonedTime(`${today}T12:00:00`, timezone), timezone, 'MMMM yyyy');
}

/** Leading blank cells so month grid aligns to Sunday start. */
export function getMonthGridPadding(today: string, timezone: string): number {
  const todayDate = toZonedTime(`${today}T12:00:00`, timezone);
  const monthStart = startOfMonth(todayDate);
  return monthStart.getDay();
}

export const HABIT_ACCENT_COLORS = [
  '#6581A2',
  '#69A859',
  '#F49F99',
  '#2C5073',
  '#C43A37',
  '#BDBD68',
] as const;

export function getHabitAccentColor(habitId: string, index: number): string {
  const hash = habitId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return HABIT_ACCENT_COLORS[(hash + index) % HABIT_ACCENT_COLORS.length];
}
