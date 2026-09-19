'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { CalendarDayCell } from '@/lib/calendar-stats';

type DayCellProps = {
  cell: CalendarDayCell;
};

export function DayCell({ cell }: DayCellProps) {
  const clickable = cell.hasJournal && !cell.isFuture;

  const content = (
    <>
      <span
        className={cn(
          'text-sm font-medium tabular-nums transition-colors duration-200',
          cell.hasJournal ? 'text-foreground' : 'text-muted-foreground/60',
          cell.isFuture && 'text-muted-foreground/30'
        )}
      >
        {cell.dayNumber}
      </span>
      <span
        className={cn(
          'mt-1 size-2 rounded-full transition-all duration-200',
          cell.hasJournal ? 'bg-primary shadow-sm' : 'bg-transparent'
        )}
        aria-hidden
      />
    </>
  );

  if (!clickable) {
    return (
      <div
        className={cn(
          'flex h-12 flex-col items-center justify-center rounded-xl transition-all duration-200',
          cell.isToday &&
            'bg-primary/10 ring-2 ring-primary/40 ring-offset-2 ring-offset-background',
          !cell.hasJournal && !cell.isToday && 'opacity-70'
        )}
        aria-label={`${cell.date}${cell.hasJournal ? ', has journal' : ', no journal'}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/calendar/${cell.date}`}
      className={cn(
        'flex h-12 flex-col items-center justify-center rounded-xl transition-all duration-200 hover:bg-primary/10 hover:scale-105',
        cell.isToday &&
          'bg-primary/10 ring-2 ring-primary/40 ring-offset-2 ring-offset-background'
      )}
      aria-label={`Open journal for ${cell.date}`}
    >
      {content}
    </Link>
  );
}
