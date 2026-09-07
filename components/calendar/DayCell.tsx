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
          'text-sm font-medium tabular-nums',
          cell.hasJournal ? 'text-foreground' : 'text-muted-foreground/70',
          cell.isFuture && 'text-muted-foreground/40',
        )}
      >
        {cell.dayNumber}
      </span>
      <span
        className={cn(
          'mt-1 size-1.5 rounded-full',
          cell.hasJournal ? 'bg-primary' : 'bg-transparent',
        )}
        aria-hidden
      />
    </>
  );

  if (!clickable) {
    return (
      <div
        className={cn(
          'flex h-11 flex-col items-center justify-center rounded-xl',
          cell.isToday && 'ring-2 ring-primary/30 ring-offset-1',
          !cell.hasJournal && 'opacity-80',
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
        'flex h-11 flex-col items-center justify-center rounded-xl transition-colors hover:bg-primary/8',
        cell.isToday && 'ring-2 ring-primary/30 ring-offset-1',
      )}
      aria-label={`Open journal for ${cell.date}`}
    >
      {content}
    </Link>
  );
}
