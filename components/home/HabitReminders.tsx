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

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm font-semibold text-muted-foreground">Today&apos;s habits</h2>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount} done
        </span>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1.5">
        {sorted.map((habit) => (
          <button
            key={habit.id}
            type="button"
            onClick={() => toggle(habit.id)}
            className={cn(
              'group inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm transition-all duration-200',
              habit.completedToday
                ? 'border-decisions/40 bg-decisions/10 text-foreground shadow-sm'
                : 'border-border/60 bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
            )}
          >
            <span
              className="text-lg transition-transform duration-200 group-hover:scale-110"
              aria-hidden
            >
              {habit.emoji}
            </span>
            <span className="font-medium">{habit.name}</span>
            {habit.completedToday && (
              <span className="flex items-center gap-1 text-xs">
                {habit.todaySource === 'voice' ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
                    <Mic2 className="size-3" />
                    <span className="text-[10px] font-medium">voice</span>
                  </span>
                ) : (
                  <CheckCircle2 className="size-3 text-decisions" />
                )}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
