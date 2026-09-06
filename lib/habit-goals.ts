import { addDays, differenceInCalendarDays, eachDayOfInterval, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import type { Habit, HabitGoalAnalytics, GoalInsightTone } from '@/lib/types/habits';
import { getPreviousDateString } from '@/lib/habit-stats';

export function getHabitGoalStartDate(habit: Habit): string {
  return habit.goalStartDate ?? habit.createdAt.slice(0, 10);
}

export function getGoalEndDate(startDate: string, goalDays: number, timezone: string): string {
  const start = toZonedTime(`${startDate}T12:00:00`, timezone);
  const end = addDays(start, goalDays - 1);
  return formatInTimeZone(end, timezone, 'yyyy-MM-dd');
}

export function countCompletionsInRange(
  completionDates: Set<string>,
  startDate: string,
  endDate: string,
): number {
  let count = 0;
  for (const date of completionDates) {
    if (date >= startDate && date <= endDate) count += 1;
  }
  return count;
}

export function calculateLongestStreak(
  completionDates: Set<string>,
  timezone: string,
): number {
  if (completionDates.size === 0) return 0;

  const sorted = [...completionDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = getPreviousDateString(sorted[i], timezone);
    if (prev === sorted[i - 1]) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function getGoalAnalytics(
  habit: Habit,
  completionDates: Set<string>,
  today: string,
  timezone: string,
): HabitGoalAnalytics {
  const goalStartDate = getHabitGoalStartDate(habit);

  if (!habit.goalDays) {
    const monthStart = today.slice(0, 8) + '01';
    const completionsThisMonth = countCompletionsInRange(completionDates, monthStart, today);
    const dayOfMonth = Number.parseInt(today.slice(8, 10), 10);

    return {
      hasGoal: false,
      goalDays: null,
      goalStartDate,
      goalEndDate: null,
      daysElapsed: Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(goalStartDate)) + 1),
      daysRemaining: null,
      completionsInGoal: completionsThisMonth,
      progressPercent: dayOfMonth > 0 ? Math.round((completionsThisMonth / dayOfMonth) * 100) : 0,
      isGoalComplete: false,
      expectedByNow: dayOfMonth,
      onTrack: completionsThisMonth >= Math.floor(dayOfMonth * 0.85),
      insight:
        completionsThisMonth >= dayOfMonth
          ? 'Perfect month so far — every day checked in.'
          : completionsThisMonth >= Math.floor(dayOfMonth * 0.7)
            ? 'Solid consistency — keep the streak alive.'
            : 'Open your detail view anytime to see patterns and catch up.',
      tone: completionsThisMonth >= dayOfMonth ? 'success' : 'neutral',
    };
  }

  const goalEndDate = getGoalEndDate(goalStartDate, habit.goalDays, timezone);
  const periodEnd = today < goalEndDate ? today : goalEndDate;
  const daysElapsed = Math.min(
    habit.goalDays,
    Math.max(0, differenceInCalendarDays(parseISO(periodEnd), parseISO(goalStartDate)) + 1),
  );
  const daysRemaining = Math.max(0, differenceInCalendarDays(parseISO(goalEndDate), parseISO(today)));
  const completionsInGoal = countCompletionsInRange(
    completionDates,
    goalStartDate,
    periodEnd,
  );
  const progressPercent = Math.round((completionsInGoal / habit.goalDays) * 100);
  const isGoalComplete = completionsInGoal >= habit.goalDays;
  const expectedByNow = daysElapsed;
  const onTrack = completionsInGoal >= expectedByNow - 1;

  let insight: string;
  let tone: GoalInsightTone;

  if (isGoalComplete) {
    insight = `Goal complete — ${habit.goalDays} days logged. Consider extending or starting fresh.`;
    tone = 'complete';
  } else if (daysRemaining === 0 && !completionDates.has(today)) {
    insight = 'Last day of your goal — check in today to finish strong.';
    tone = 'warning';
  } else if (completionsInGoal >= expectedByNow) {
    insight = `Ahead of schedule — ${completionsInGoal} of ${habit.goalDays} days done.`;
    tone = 'success';
  } else if (onTrack) {
    const behind = expectedByNow - completionsInGoal;
    insight =
      behind === 1
        ? 'One day behind — today is a great catch-up day.'
        : `${behind} days behind — you can still hit your goal with focus.`;
    tone = 'warning';
  } else {
    insight = `${daysRemaining} days left — aim for daily check-ins to reach ${habit.goalDays}.`;
    tone = 'on-track';
  }

  return {
    hasGoal: true,
    goalDays: habit.goalDays,
    goalStartDate,
    goalEndDate,
    daysElapsed,
    daysRemaining,
    completionsInGoal,
    progressPercent: Math.min(100, progressPercent),
    isGoalComplete,
    expectedByNow,
    onTrack,
    insight,
    tone,
  };
}

/** Last N weeks as rows of 7 days (HabitKit-style heatmap). */
export function getHeatmapWeeks(
  completionDates: Set<string>,
  today: string,
  timezone: string,
  weeks = 12,
): { date: string; completed: boolean; isToday: boolean }[][] {
  const todayDate = toZonedTime(`${today}T12:00:00`, timezone);
  const start = addDays(todayDate, -(weeks * 7 - 1));

  const days = eachDayOfInterval({ start, end: todayDate }).map((day) => {
    const date = formatInTimeZone(day, timezone, 'yyyy-MM-dd');
    return {
      date,
      completed: completionDates.has(date),
      isToday: date === today,
    };
  });

  const rows: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }
  return rows;
}

export function getRecommendedPreset(name: string): number | null {
  const lower = name.toLowerCase();
  if (/meditat|mindful|journal|gratitude/.test(lower)) return 66;
  if (/workout|exercise|run|gym|walk|steps/.test(lower)) return 30;
  if (/read|study|learn|practice/.test(lower)) return 21;
  if (/water|sleep|vitamin/.test(lower)) return 30;
  return 30;
}
