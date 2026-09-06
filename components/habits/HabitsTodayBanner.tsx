'use client';

import type { HabitWithTodayStatus } from '@/lib/types/habits';

type HabitsTodayBannerProps = {
  habits: HabitWithTodayStatus[];
};

export function HabitsTodayBanner({ habits }: HabitsTodayBannerProps) {
  const total = habits.length;
  const completed = habits.filter((habit) => habit.completedToday).length;
  const progress = total === 0 ? 0 : completed / total;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - progress);

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/[0.04] bg-card px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="relative size-12 shrink-0">
        <svg className="size-12 -rotate-90" viewBox="0 0 40 40" aria-hidden>
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/80"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-decisions transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
          {completed}/{total}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight">Today</p>
        <p className="text-[13px] text-muted-foreground">
          {completed === total
            ? 'All habits complete — nice work!'
            : `${total - completed} left to go`}
        </p>
      </div>
    </div>
  );
}
