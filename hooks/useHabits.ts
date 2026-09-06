'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { addHabit, editHabit, removeHabit, toggleHabitToday } from '@/lib/api/habits';
import {
  getHabitsSnapshot,
  getServerHabitsSnapshot,
  HABITS_CHANGED_EVENT,
} from '@/lib/local-habits';

const snapshotByDate = new Map<string, () => ReturnType<typeof getHabitsSnapshot>>();

function getSnapshotForDate(date: string) {
  let getSnapshot = snapshotByDate.get(date);
  if (!getSnapshot) {
    getSnapshot = () => getHabitsSnapshot(date);
    snapshotByDate.set(date, getSnapshot);
  }
  return getSnapshot;
}

function subscribeHabits(onStoreChange: () => void) {
  window.addEventListener(HABITS_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(HABITS_CHANGED_EVENT, onStoreChange);
}

export function useHabits(date: string) {
  const habits = useSyncExternalStore(
    subscribeHabits,
    getSnapshotForDate(date),
    getServerHabitsSnapshot,
  );

  const create = useCallback(
    (name: string, emoji: string, goalDays: number | null) => addHabit(name, emoji, goalDays),
    [],
  );
  const update = useCallback((id: string, patch: { name?: string; emoji?: string }) => {
    editHabit(id, patch);
  }, []);
  const archive = useCallback((id: string) => removeHabit(id), []);
  const toggle = useCallback((habitId: string) => toggleHabitToday(habitId), []);

  return { habits, create, update, archive, toggle };
}
