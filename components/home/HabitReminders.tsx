'use client';

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
    <section className="flex flex-col gap-2">
      <h2 className="px-0.5 text-sm font-semibold text-muted-foreground">Today&apos;s habits</h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {sorted.map((habit) => (
          <button
            key={habit.id}
            type="button"
            onClick={() => toggle(habit.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              habit.completedToday
                ? 'border-decisions/30 bg-decisions/10 text-foreground'
                : 'border-black/[0.06] bg-card text-foreground hover:bg-muted',
            )}
          >
            <span aria-hidden>{habit.emoji}</span>
            <span>{habit.name}</span>
            {habit.completedToday && (
              <span className="text-xs text-muted-foreground">
                {habit.todaySource === 'voice' ? '· voice' : '· done'}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
