export type CompletionSource = 'voice' | 'manual';

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  isActive: boolean;
  createdAt: string;
  /** null = ongoing, no end date */
  goalDays: number | null;
  /** YYYY-MM-DD when the goal period started */
  goalStartDate: string;
};

export type HabitCompletion = {
  habitId: string;
  date: string;
  source: CompletionSource;
  voiceEntryId?: string;
};

export type HabitWithTodayStatus = Habit & {
  completedToday: boolean;
  todaySource: CompletionSource | null;
};

export type GoalPreset = {
  days: number | null;
  label: string;
  subtitle: string;
  science?: string;
};

export const GOAL_PRESETS: GoalPreset[] = [
  {
    days: 21,
    label: '21 days',
    subtitle: 'Routine builder',
    science: 'Popular minimum to establish a daily rhythm',
  },
  {
    days: 30,
    label: '30 days',
    subtitle: 'One-month challenge',
    science: 'A full calendar month of consistency',
  },
  {
    days: 66,
    label: '66 days',
    subtitle: 'Habit formation',
    science: 'Often cited research window for automatic habits',
  },
  {
    days: 90,
    label: '90 days',
    subtitle: 'Quarter goal',
    science: 'Long enough to see real lifestyle change',
  },
  {
    days: 365,
    label: '1 year',
    subtitle: 'Year-long commitment',
  },
  {
    days: null,
    label: 'Ongoing',
    subtitle: 'No end date',
    science: 'Track forever — focus on streaks and monthly rate',
  },
];

export type GoalInsightTone = 'success' | 'on-track' | 'warning' | 'neutral' | 'complete';

export type HabitGoalAnalytics = {
  hasGoal: boolean;
  goalDays: number | null;
  goalStartDate: string;
  goalEndDate: string | null;
  daysElapsed: number;
  daysRemaining: number | null;
  completionsInGoal: number;
  progressPercent: number;
  isGoalComplete: boolean;
  expectedByNow: number;
  onTrack: boolean;
  insight: string;
  tone: GoalInsightTone;
};

export type HabitDetailStats = {
  currentStreak: number;
  longestStreak: number;
  monthRate: number;
  voiceCompletions: number;
  totalCompletions: number;
  goal: HabitGoalAnalytics;
};
