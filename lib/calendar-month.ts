import { formatInTimeZone } from 'date-fns-tz';
import { getAllLocalCaptures } from '@/lib/local-captures';
import { listLocalJournalDates } from '@/lib/local-journal';
import { detectBrowserTimezone } from '@/lib/timezone';

function monthPrefix(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Dates in a month that have a journal breakdown or transcribed captures. */
export function getJournaledDatesInMonth(
  year: number,
  month: number,
  timezone = detectBrowserTimezone(),
): Set<string> {
  const prefix = monthPrefix(year, month);
  const dates = new Set<string>();

  for (const date of listLocalJournalDates()) {
    if (date.startsWith(prefix)) dates.add(date);
  }

  for (const entry of getAllLocalCaptures()) {
    if (entry.status !== 'transcribed' || !entry.transcript?.trim()) continue;
    const entryDay = formatInTimeZone(new Date(entry.recordedAt), timezone, 'yyyy-MM-dd');
    if (entryDay.startsWith(prefix)) dates.add(entryDay);
  }

  return dates;
}
