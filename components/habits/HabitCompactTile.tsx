'use client';

import { Flame } from 'lucide-react';
import { getAllCompletions } from '@/lib/local-habits';
import { getGoalAnalytics } from '@/lib/habit-goals';
import {
  calculateCurrentStreak,
  getCompletionDates,
  getHabitAccentColor,
  getMonthCells,
  getMonthCompletionRate,
} from '@/lib/habit-stats';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { HabitWithTodayStatus } from '@/lib/types/habits';
import { cn } from '@/lib/utils';

type HabitCompactTileProps = {
  habit: HabitWithTodayStatus;
  index: number;
  selected?: boolean;
  onOpenDetail: () => void;
  onToggleToday: () => void;
};

export function HabitCompactTile({
  habit,
  index,
  selected = false,
  onOpenDetail,
  onToggleToday,
}: HabitCompactTileProps) {
  const timezone = detectBrowserTimezone();
  const today = getTodayDateString(timezone);
  const accentColor = getHabitAccentColor(habit.id, index);
  const completionDates = getCompletionDates(getAllCompletions(), habit.id);
  const streak = calculateCurrentStreak(completionDates, today, timezone);
  const goal = getGoalAnalytics(habit, completionDates, today, timezone);
  const monthRate = getMonthCompletionRate(getMonthCells(completionDates, today, timezone));
  const barPercent = goal.hasGoal ? goal.progressPercent : monthRate;

  const progressLabel = goal.hasGoal
    ? `${goal.completionsInGoal}/${goal.goalDays}`
    : `${goal.completionsInGoal} this mo.`;

  return (
    <article
      className={cn(
        'flex w-[7.5rem] shrink-0 flex-col rounded-2xl border bg-card p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow',
        selected
          ? 'border-primary/40 ring-2 ring-primary/20 shadow-[0_2px_12px_rgba(101,129,162,0.15)]'
          : 'border-black/[0.04]',
        habit.completedToday && !selected && 'ring-1 ring-decisions/25',
      )}
    >
      <button
        type="button"
        onClick={onOpenDetail}
        className="flex flex-col items-center gap-1 text-center"
        aria-label={`${selected ? 'Close' : 'Open'} ${habit.name} breakdown`}
        aria-expanded={selected}
      >
        <span
          className="flex size-14 items-center justify-center rounded-2xl text-3xl transition-transform hover:scale-105"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {habit.emoji}
        </span>
        <span className="line-clamp-2 w-full text-xs font-semibold leading-tight">{habit.name}</span>
      </button>

      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, barPercent)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{progressLabel}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground/80">
              <Flame className="size-3 text-orange-500" aria-hidden />
              {streak}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleToday();
        }}
        className={cn(
          'mt-2 w-full rounded-xl py-1.5 text-[11px] font-medium transition-colors',
          habit.completedToday
            ? 'bg-decisions/15 text-decisions'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        {habit.completedToday ? 'Done today' : 'Check in'}
      </button>
    </article>
  );
}
