'use client';

import { Flame, Check } from 'lucide-react';
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
        'flex w-[7.5rem] shrink-0 flex-col rounded-2xl border-2 bg-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200',
        selected
          ? 'border-primary/50 shadow-[0_4px_16px_rgba(0,0,0,0.08)] scale-[1.02]'
          : 'border-border/60 hover:border-border hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]',
        habit.completedToday && !selected && 'border-decisions/40 bg-decisions/5'
      )}
    >
      <button
        type="button"
        onClick={onOpenDetail}
        className="flex flex-col items-center gap-1.5 text-center"
        aria-label={`${selected ? 'Close' : 'Open'} ${habit.name} breakdown`}
        aria-expanded={selected}
      >
        <span
          className="flex size-14 items-center justify-center rounded-2xl text-3xl transition-transform duration-200 hover:scale-110"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {habit.emoji}
        </span>
        <span className="line-clamp-2 w-full text-xs font-semibold leading-tight">
          {habit.name}
        </span>
      </button>

      <div className="mt-2.5 space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(100, barPercent)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{progressLabel}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5 font-semibold text-foreground/80">
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
          'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold transition-all duration-200',
          habit.completedToday
            ? 'bg-decisions/15 text-decisions'
            : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )}
      >
        {habit.completedToday ? (
          <>
            <Check className="size-3" />
            Done
          </>
        ) : (
          'Check in'
        )}
      </button>
    </article>
  );
}
