import type {
  CompletionSource,
  Habit,
  HabitCompletion,
  HabitWithTodayStatus,
} from '@/lib/types/habits';

const HABITS_KEY = 'firnal:habits';
const COMPLETIONS_KEY = 'firnal:habit-completions';

export const HABITS_CHANGED_EVENT = 'firnal:habits-changed';

const SERVER_HABITS_SNAPSHOT: HabitWithTodayStatus[] = [];
let clientHabitsSnapshot: HabitWithTodayStatus[] = SERVER_HABITS_SNAPSHOT;
let clientSnapshotDate = '';

function normalizeHabit(raw: Partial<Habit> & Pick<Habit, 'id' | 'name' | 'emoji' | 'createdAt'>): Habit {
  return {
    id: raw.id,
    name: raw.name,
    emoji: raw.emoji,
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt,
    goalDays: raw.goalDays ?? null,
    goalStartDate: raw.goalStartDate ?? raw.createdAt.slice(0, 10),
  };
}

function readHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Habit>[];
    return Array.isArray(parsed) ? parsed.map((h) => normalizeHabit(h as Habit)) : [];
  } catch {
    return [];
  }
}

function writeHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function readCompletions(): HabitCompletion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HabitCompletion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCompletions(completions: HabitCompletion[]) {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

function habitsSignature(habits: HabitWithTodayStatus[]) {
  return habits
    .map(
      (habit) =>
        `${habit.id}:${habit.name}:${habit.emoji}:${habit.isActive}:${habit.goalDays}:${habit.goalStartDate}:${habit.completedToday}:${habit.todaySource ?? ''}`,
    )
    .join('|');
}

export function getHabitsWithTodayStatus(date: string): HabitWithTodayStatus[] {
  const completions = readCompletions().filter((row) => row.date === date);
  const completionByHabit = new Map(completions.map((row) => [row.habitId, row]));

  return readHabits()
    .filter((habit) => habit.isActive)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((habit) => {
      const completion = completionByHabit.get(habit.id);
      return {
        ...habit,
        completedToday: Boolean(completion),
        todaySource: completion?.source ?? null,
      };
    });
}

export function getHabitsSnapshot(date: string): HabitWithTodayStatus[] {
  const next = getHabitsWithTodayStatus(date);
  if (clientSnapshotDate === date && habitsSignature(clientHabitsSnapshot) === habitsSignature(next)) {
    return clientHabitsSnapshot;
  }
  clientSnapshotDate = date;
  clientHabitsSnapshot = next;
  return next;
}

export function getServerHabitsSnapshot() {
  return SERVER_HABITS_SNAPSHOT;
}

export function getActiveHabitNames(): string[] {
  return readHabits()
    .filter((habit) => habit.isActive)
    .map((habit) => habit.name);
}

export function getCompletionsForHabit(habitId: string): HabitCompletion[] {
  return readCompletions().filter((row) => row.habitId === habitId);
}

export function getAllCompletions(): HabitCompletion[] {
  return readCompletions();
}

export function createHabit(
  name: string,
  emoji: string,
  goalDays: number | null,
  goalStartDate: string,
): Habit {
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: name.trim(),
    emoji: emoji.trim() || '✓',
    isActive: true,
    createdAt: new Date().toISOString(),
    goalDays,
    goalStartDate,
  };
  const habits = readHabits();
  habits.push(habit);
  writeHabits(habits);
  notifyHabitsChanged();
  return habit;
}

export function updateHabit(
  id: string,
  patch: Partial<Pick<Habit, 'name' | 'emoji' | 'isActive' | 'goalDays' | 'goalStartDate'>>,
) {
  const habits = readHabits().map((habit) =>
    habit.id === id
      ? {
          ...habit,
          ...patch,
          name: patch.name !== undefined ? patch.name.trim() : habit.name,
          emoji: patch.emoji !== undefined ? patch.emoji.trim() || '✓' : habit.emoji,
        }
      : habit,
  );
  writeHabits(habits);
  notifyHabitsChanged();
}

export function archiveHabit(id: string) {
  updateHabit(id, { isActive: false });
}

export function toggleHabitForDate(habitId: string, date: string, source: CompletionSource = 'manual') {
  const completions = readCompletions();
  const index = completions.findIndex((row) => row.habitId === habitId && row.date === date);

  if (index >= 0) {
    completions.splice(index, 1);
  } else {
    completions.push({ habitId, date, source });
  }

  writeCompletions(completions);
  notifyHabitsChanged();
}

export function completeHabitFromVoice(habitId: string, date: string, voiceEntryId: string) {
  const completions = readCompletions();
  const exists = completions.some((row) => row.habitId === habitId && row.date === date);
  if (exists) return;

  completions.push({ habitId, date, source: 'voice', voiceEntryId });
  writeCompletions(completions);
  notifyHabitsChanged();
}

export function notifyHabitsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HABITS_CHANGED_EVENT));
  }
}

/** For Phase 9 migration */
export function getAllHabitsData() {
  return { habits: readHabits(), completions: readCompletions() };
}
