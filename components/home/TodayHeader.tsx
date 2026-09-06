'use client';

import { formatInTimeZone } from 'date-fns-tz';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';

export function TodayHeader() {
  const timezone = detectBrowserTimezone();
  const today = getTodayDateString(timezone);
  const label = formatInTimeZone(new Date(), timezone, 'EEEE, MMM d');

  return (
    <header className="px-0.5">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{label}</h1>
      <p className="mt-0.5 text-[15px] text-muted-foreground">Today · {today}</p>
    </header>
  );
}
