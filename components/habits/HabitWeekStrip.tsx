'use client';

import { cn } from '@/lib/utils';
import type { HabitWeekDay } from '@/lib/habit-stats';

type HabitWeekStripProps = {
  days: HabitWeekDay[];
  accentColor: string;
};

export function HabitWeekStrip({ days, accentColor }: HabitWeekStripProps) {
  return (
    <div className="flex justify-between gap-1">
      {days.map((day) => (
        <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
          <span
            className={cn(
              'text-[10px] font-medium',
              day.isToday ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {day.weekdayLabel}
          </span>
          <span
            className={cn(
              'size-2.5 rounded-full transition-colors',
              day.isFuture && 'bg-muted',
              !day.isFuture && !day.completed && 'bg-muted',
              day.completed && 'scale-110',
              day.isToday && !day.completed && 'ring-2 ring-offset-1',
            )}
            style={{
              backgroundColor: day.completed ? accentColor : undefined,
              ...(day.isToday && !day.completed
                ? ({ '--tw-ring-color': accentColor } as React.CSSProperties)
                : {}),
            }}
            aria-label={`${day.date}${day.completed ? ', completed' : ''}`}
          />
        </div>
      ))}
    </div>
  );
}
