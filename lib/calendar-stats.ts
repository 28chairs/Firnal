import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export type CalendarDayCell = {
  date: string;
  dayNumber: number;
  hasJournal: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export function getMonthLabelFor(year: number, month: number, timezone: string): string {
  const anchor = toZonedTime(`${year}-${String(month).padStart(2, '0')}-15T12:00:00`, timezone);
  return formatInTimeZone(anchor, timezone, 'MMMM yyyy');
}

export function getMonthGridPaddingFor(year: number, month: number, timezone: string): number {
  const anchor = toZonedTime(`${year}-${String(month).padStart(2, '0')}-01T12:00:00`, timezone);
  const monthStart = startOfMonth(anchor);
  return monthStart.getDay();
}

export function getCalendarMonthCells(
  year: number,
  month: number,
  today: string,
  timezone: string,
  journalDates: Set<string>,
): CalendarDayCell[] {
  const anchor = toZonedTime(`${year}-${String(month).padStart(2, '0')}-15T12:00:00`, timezone);
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
    const date = formatInTimeZone(day, timezone, 'yyyy-MM-dd');
    return {
      date,
      dayNumber: Number(format(day, 'd')),
      hasJournal: journalDates.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

export function shiftMonth(
  year: number,
  month: number,
  delta: -1 | 1,
): { year: number; month: number } {
  const next = month + delta;
  if (next < 1) return { year: year - 1, month: 12 };
  if (next > 12) return { year: year + 1, month: 1 };
  return { year, month: next };
}
