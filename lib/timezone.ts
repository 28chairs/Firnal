import { fromZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/** Detect browser IANA timezone (client-only). */
export function detectBrowserTimezone(): string {
  if (typeof Intl === 'undefined') return 'UTC';
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/** Today's date as YYYY-MM-DD in the given timezone. */
export function getTodayDateString(timezone: string): string {
  return format(toZonedTime(new Date(), timezone), 'yyyy-MM-dd');
}

/** UTC bounds for a calendar day in the user's timezone. */
export function getDayBounds(date: string, timezone: string): { startUtc: Date; endUtc: Date } {
  const startUtc = fromZonedTime(`${date}T00:00:00`, timezone);
  const endUtc = fromZonedTime(`${date}T23:59:59.999`, timezone);
  return { startUtc, endUtc };
}
