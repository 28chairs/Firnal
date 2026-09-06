'use client';

import { cn } from '@/lib/utils';
import type { HabitDayCell } from '@/lib/habit-stats';

type HabitMonthGridProps = {
  monthLabel: string;
  padding: number;
  days: HabitDayCell[];
  accentColor: string;
};

const WEEK_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitMonthGrid({ monthLabel, padding, days, accentColor }: HabitMonthGridProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{monthLabel}</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEK_HEADERS.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="text-center text-[9px] font-medium text-muted-foreground/70"
          >
            {label}
          </span>
        ))}
        {Array.from({ length: padding }).map((_, index) => (
          <span key={`pad-${index}`} />
        ))}
        {days.map((day) => (
          <span
            key={day.date}
            className={cn(
              'mx-auto size-2 rounded-full transition-all',
              day.isFuture && 'bg-transparent',
              !day.isFuture && !day.completed && 'bg-muted',
              day.completed && 'scale-110',
              day.isToday && 'ring-1 ring-offset-1',
            )}
            style={{
              backgroundColor: day.completed ? accentColor : undefined,
              ...(day.isToday
                ? ({ '--tw-ring-color': accentColor } as React.CSSProperties)
                : {}),
            }}
            title={day.date}
          />
        ))}
      </div>
    </div>
  );
}
