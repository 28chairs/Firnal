'use client';

import { Flame, Target, Trophy, X, Zap } from 'lucide-react';
import { HabitCompleteRing } from '@/components/habits/HabitCompleteRing';
import { HabitMonthGrid } from '@/components/habits/HabitMonthGrid';
import { HabitWeekStrip } from '@/components/habits/HabitWeekStrip';
import { getAllCompletions } from '@/lib/local-habits';
import {
  calculateLongestStreak,
  getGoalAnalytics,
  getHeatmapWeeks,
} from '@/lib/habit-goals';
import {
  calculateCurrentStreak,
  getCompletionDates,
  getHabitAccentColor,
  getMonthCells,
  getMonthCompletionRate,
  getMonthGridPadding,
  getMonthLabel,
  getWeekCells,
} from '@/lib/habit-stats';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { GoalInsightTone, HabitWithTodayStatus } from '@/lib/types/habits';
import { cn } from '@/lib/utils';

type HabitDetailPanelProps = {
  habit: HabitWithTodayStatus;
  index: number;
  onClose: () => void;
  onToggle: (habitId: string) => void;
};

const TONE_STYLES: Record<GoalInsightTone, string> = {
  success: 'border-decisions/30 bg-decisions/10 text-foreground',
  'on-track': 'border-primary/30 bg-primary/10 text-foreground',
  warning: 'border-orange-300/40 bg-orange-50 text-foreground',
  neutral: 'border-black/[0.06] bg-muted/50 text-muted-foreground',
  complete: 'border-decisions/40 bg-decisions/15 text-foreground',
};

export function HabitDetailPanel({ habit, index, onClose, onToggle }: HabitDetailPanelProps) {
  const timezone = detectBrowserTimezone();
  const today = getTodayDateString(timezone);
  const accentColor = getHabitAccentColor(habit.id, index);
  const completions = getAllCompletions().filter((row) => row.habitId === habit.id);
  const completionDates = getCompletionDates(completions, habit.id);
  const monthCells = getMonthCells(completionDates, today, timezone);
  const goal = getGoalAnalytics(habit, completionDates, today, timezone);
  const currentStreak = calculateCurrentStreak(completionDates, today, timezone);
  const longestStreak = calculateLongestStreak(completionDates, timezone);
  const voiceCompletions = completions.filter((row) => row.source === 'voice').length;
  const heatmapWeeks = getHeatmapWeeks(completionDates, today, timezone, 12);

  return (
    <section
      id={`habit-detail-${habit.id}`}
      aria-label={`${habit.name} breakdown`}
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      style={{ borderTopColor: accentColor, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-black/[0.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            {habit.emoji}
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{habit.name}</h2>
            <p className="text-xs text-muted-foreground">
              {goal.hasGoal
                ? `${goal.goalDays}-day goal · ${goal.daysRemaining ?? 0} days left`
                : 'Ongoing habit'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close breakdown"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-center">
          <HabitCompleteRing
            emoji={habit.emoji}
            completed={habit.completedToday}
            accentColor={accentColor}
            onToggle={() => onToggle(habit.id)}
            name={habit.name}
          />
        </div>

        <div
          className={cn('rounded-xl border px-3 py-2.5 text-sm leading-snug', TONE_STYLES[goal.tone])}
        >
          {goal.insight}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={<Flame className="size-4 text-orange-500" />}
            label="Current streak"
            value={`${currentStreak} day${currentStreak === 1 ? '' : 's'}`}
          />
          <StatCard
            icon={<Trophy className="size-4 text-primary" />}
            label="Best streak"
            value={`${longestStreak} day${longestStreak === 1 ? '' : 's'}`}
          />
          <StatCard
            icon={<Target className="size-4 text-ideas" />}
            label={goal.hasGoal ? 'Goal progress' : 'This month'}
            value={
              goal.hasGoal
                ? `${goal.completionsInGoal}/${goal.goalDays}`
                : `${getMonthCompletionRate(monthCells)}%`
            }
          />
          <StatCard
            icon={<Zap className="size-4 text-questions" />}
            label="Via voice"
            value={String(voiceCompletions)}
          />
        </div>

        {goal.hasGoal && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Goal progress</span>
              <span>{goal.progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${goal.progressPercent}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-black/[0.04] bg-muted/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last 12 weeks
          </p>
          <div className="flex flex-col gap-1">
            {heatmapWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {week.map((day) => (
                  <span
                    key={day.date}
                    className={cn(
                      'size-2.5 rounded-sm',
                      day.isToday && 'ring-1 ring-offset-1',
                      !day.completed && 'bg-muted',
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
            ))}
          </div>
        </div>

        <HabitWeekStrip days={getWeekCells(completionDates, today, timezone)} accentColor={accentColor} />

        <HabitMonthGrid
          monthLabel={getMonthLabel(today, timezone)}
          padding={getMonthGridPadding(today, timezone)}
          days={monthCells}
          accentColor={accentColor}
        />

        {habit.completedToday && habit.todaySource === 'voice' && (
          <p className="text-center text-xs font-medium text-primary">Checked via voice today</p>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.04] bg-card px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">{icon}</div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
