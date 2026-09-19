'use client';

import { CheckCircle2, Mic2 } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import { cn } from '@/lib/utils';

export function HabitReminders() {
  const date = getTodayDateString(detectBrowserTimezone());
  const { habits, toggle } = useHabits(date);

  if (habits.length === 0) {
    return null;
  }

  const sorted = [...habits].sort((a, b) => {
    if (a.completedToday === b.completedToday) return 0;
    return a.completedToday ? 1 : -1;
  });

  return (
    <div className="-mx-1 flex flex-wrap items-center gap-1.5 px-1">
      <span className="mr-1 text-xs font-medium text-muted-foreground">Habits</span>
      {sorted.map((habit) => (
        <button
          key={habit.id}
          type="button"
          onClick={() => toggle(habit.id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
            habit.completedToday
              ? 'border-decisions/30 bg-decisions/10 text-foreground'
              : 'border-border/60 bg-card text-foreground hover:bg-muted',
          )}
        >
          <span aria-hidden className="text-sm">{habit.emoji}</span>
          <span>{habit.name}</span>
          {habit.completedToday && (
            habit.todaySource === 'voice' ? (
              <Mic2 className="size-3 text-primary" />
            ) : (
              <CheckCircle2 className="size-3 text-decisions" />
            )
          )}
        </button>
      ))}
    </div>
  );
}
