'use client';

import {
  archiveHabit,
  completeHabitFromVoice,
  createHabit,
  getHabitsWithTodayStatus,
  toggleHabitForDate,
  updateHabit,
} from '@/lib/local-habits';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { HabitWithTodayStatus } from '@/lib/types/habits';

export function getTodayHabits(): HabitWithTodayStatus[] {
  const date = getTodayDateString(detectBrowserTimezone());
  return getHabitsWithTodayStatus(date);
}

export function addHabit(name: string, emoji: string, goalDays: number | null) {
  const date = getTodayDateString(detectBrowserTimezone());
  return createHabit(name, emoji, goalDays, date);
}

export function editHabit(id: string, patch: { name?: string; emoji?: string }) {
  updateHabit(id, patch);
}

export function removeHabit(id: string) {
  archiveHabit(id);
}

export function toggleHabitToday(habitId: string) {
  const date = getTodayDateString(detectBrowserTimezone());
  toggleHabitForDate(habitId, date, 'manual');
}

export async function detectAndApplyHabits(voiceEntryId: string, transcript: string) {
  const habits = getTodayHabits();
  if (habits.length === 0 || !transcript.trim()) return;

  const response = await fetch('/api/habits/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      habits: habits.map((habit) => ({ id: habit.id, name: habit.name })),
    }),
  });

  if (!response.ok) return;

  const payload = (await response.json()) as { completedHabitIds: string[] };
  const date = getTodayDateString(detectBrowserTimezone());

  for (const habitId of payload.completedHabitIds) {
    completeHabitFromVoice(habitId, date, voiceEntryId);
  }
}
