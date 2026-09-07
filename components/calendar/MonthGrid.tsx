'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayCell } from '@/components/calendar/DayCell';
import { Button } from '@/components/ui/button';
import { useCalendarMonth } from '@/hooks/useCalendarMonth';
import {
  getCalendarMonthCells,
  getMonthGridPaddingFor,
  getMonthLabelFor,
  shiftMonth,
} from '@/lib/calendar-stats';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';

const WEEK_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthGrid() {
  const timezone = detectBrowserTimezone();
  const today = getTodayDateString(timezone);
  const todayParts = today.split('-').map(Number);
  const [year, setYear] = useState(todayParts[0]!);
  const [month, setMonth] = useState(todayParts[1]!);

  const journalDates = useCalendarMonth(year, month);
  const monthLabel = getMonthLabelFor(year, month, timezone);
  const padding = getMonthGridPaddingFor(year, month, timezone);
  const cells = getCalendarMonthCells(
    year,
    month,
    today,
    timezone,
    journalDates,
  );
  const hasEntries = cells.some((cell) => cell.hasJournal);

  const goMonth = (delta: -1 | 1) => {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/[0.04] bg-card p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <header className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="text-base font-semibold tracking-tight">{monthLabel}</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => goMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight className="size-5" />
        </Button>
      </header>

      <div className="grid grid-cols-7 gap-1">
        {WEEK_HEADERS.map((label) => (
          <span
            key={label}
            className="pb-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {label}
          </span>
        ))}
        {Array.from({ length: padding }).map((_, index) => (
          <span key={`pad-${index}`} aria-hidden />
        ))}
        {cells.map((cell) => (
          <DayCell key={cell.date} cell={cell} />
        ))}
      </div>

      {!hasEntries && (
        <p className="text-center text-sm text-muted-foreground">No entries this month</p>
      )}
    </section>
  );
}
