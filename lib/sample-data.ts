'use client';

import { addLocalCapture } from '@/lib/local-captures';
import { saveLocalJournal, notifyJournalChanged, listLocalJournalDates } from '@/lib/local-journal';
import { createHabit, completeHabitFromVoice, getAllHabitsData, notifyHabitsChanged } from '@/lib/local-habits';
import { notifyCapturesChanged } from '@/lib/recording';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { DailyFlowchart } from '@/lib/schemas';
import type { VoiceEntry } from '@/lib/types/voice';
import { subDays, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const SEEDED_FLAG = 'firnal:sample-days-seeded';

function dayString(offset: number, timezone: string): string {
  const today = toZonedTime(new Date(), timezone);
  return format(subDays(today, offset), 'yyyy-MM-dd');
}

function isoOnDay(date: string, time: string, timezone: string): string {
  return fromZonedTime(`${date}T${time}`, timezone).toISOString();
}

function flowchartFor(
  title: string,
  summary: string,
  transcript: string,
  data: Omit<DailyFlowchart, 'title' | 'summary' | 'mergedTranscript' | 'spans' | 'mood'> & {
    mood?: string;
  },
): DailyFlowchart {
  return {
    title,
    summary,
    mergedTranscript: transcript,
    spans: [],
    commitments: data.commitments,
    decisions: data.decisions,
    ideas: data.ideas,
    people: data.people,
    questions: data.questions,
    mood: data.mood,
  };
}

function makeCapture(
  id: string,
  recordedAt: string,
  transcript: string,
  durationMs: number,
): VoiceEntry {
  return {
    id,
    recordedAt,
    transcript,
    status: 'transcribed',
    errorMessage: null,
    durationMs,
    retryCount: 0,
  };
}

/** Seed three rich sample days (today + previous two). Replaces sample-tagged entries only when force=true clears all local demo data first. */
export function seedThreeSampleDays(options?: { force?: boolean }): { dates: string[] } {
  if (typeof window === 'undefined') return { dates: [] };

  const timezone = detectBrowserTimezone();
  const d0 = dayString(0, timezone);
  const d1 = dayString(1, timezone);
  const d2 = dayString(2, timezone);
  const dates = [d2, d1, d0];

  if (!options?.force && localStorage.getItem(SEEDED_FLAG) === '1' && listLocalJournalDates().length >= 3) {
    return { dates };
  }

  // Drop prior sample captures so force re-seed stays clean
  try {
    const raw = localStorage.getItem('firnal:voice-entries');
    const all = raw ? (JSON.parse(raw) as { id: string }[]) : [];
    if (Array.isArray(all)) {
      localStorage.setItem(
        'firnal:voice-entries',
        JSON.stringify(all.filter((e) => !String(e.id).startsWith('sample-'))),
      );
    }
  } catch {
    /* ignore */
  }

  // Habits
  let habits = getAllHabitsData().habits.filter((h) => h.isActive);
  if (habits.length === 0) {
    createHabit('Meditate', '🧘', 30, d2);
    createHabit('Walk', '🚶', 21, d2);
    createHabit('Read', '📚', null, d2);
    habits = getAllHabitsData().habits.filter((h) => h.isActive);
  }
  const meditate = habits.find((h) => h.name === 'Meditate') ?? habits[0];
  const walk = habits.find((h) => h.name === 'Walk') ?? habits[1] ?? habits[0];
  const read = habits.find((h) => h.name === 'Read') ?? habits[2] ?? habits[0];

  // --- Day -2: busy Monday energy ---
  const t2a =
    "Okay so this morning I meditated for ten minutes then walked to the cafe. I decided to ship the profile polish before calendar sync. Need to email Jordan about the design review. Idea: sample days button so demos don't look empty. Question — should we keep local-first until auth feels solid?";
  const c2a = makeCapture('sample-d2-a', isoOnDay(d2, '09:12:00', timezone), t2a, 42000);
  const c2b = makeCapture(
    'sample-d2-b',
    isoOnDay(d2, '18:40:00', timezone),
    'Evening dump: read twenty pages, felt calm. Commitment to open PR tomorrow morning.',
    28000,
  );
  addLocalCapture(c2a);
  addLocalCapture(c2b);
  completeHabitFromVoice(meditate.id, d2, c2a.id);
  completeHabitFromVoice(walk.id, d2, c2a.id);
  completeHabitFromVoice(read.id, d2, c2b.id);
  saveLocalJournal(d2, {
    breakdown: flowchartFor(
      'Ship the polish',
      'A focused day: movement, a clear product decision, and one design follow-up.',
      `${t2a} ${c2b.transcript}`,
      {
        commitments: ['Open PR tomorrow morning', 'Email Jordan about design review'],
        decisions: ['Ship profile polish before calendar sync'],
        ideas: ['Sample days button so demos don’t look empty'],
        people: [{ name: 'Jordan', initial: 'J' }],
        questions: ['Keep local-first until auth feels solid?'],
        mood: 'focused',
      },
    ),
    generatedAt: isoOnDay(d2, '19:00:00', timezone),
    error: null,
  });

  // --- Day -1: social / lighter ---
  const t1 =
    "Met Priya for lunch and we talked about the voice journal vibe — less chatbot, more day map. I decided not to add a therapy tone. Still need to meditate tonight. Idea for soft empty states. Question: does the FAB feel obvious enough on iPhone?";
  const c1 = makeCapture('sample-d1-a', isoOnDay(d1, '13:05:00', timezone), t1, 51000);
  addLocalCapture(c1);
  completeHabitFromVoice(meditate.id, d1, c1.id);
  saveLocalJournal(d1, {
    breakdown: flowchartFor(
      'Lunch & clarity',
      'A lighter day with a sharp product instinct: artifact over chat.',
      t1,
      {
        commitments: ['Meditate tonight'],
        decisions: ['No therapy-bot tone in the product'],
        ideas: ['Softer empty states'],
        people: [{ name: 'Priya', initial: 'P' }],
        questions: ['Does the FAB feel obvious enough on iPhone?'],
        mood: 'light',
      },
    ),
    generatedAt: isoOnDay(d1, '13:20:00', timezone),
    error: null,
  });

  // --- Today ---
  const today = getTodayDateString(timezone);
  const t0 =
    "Morning on Chair Phone — testing the Capacitor build. Walked around the block. Commitment: jot three sample days so the UI isn’t empty. Decision: polish mobile before Phase 9 auth. Idea: trust banner was the only blocker. Question: what still feels awkward with one hand?";
  const c0 = makeCapture('sample-d0-a', isoOnDay(today, '08:30:00', timezone), t0, 36000);
  addLocalCapture(c0);
  completeHabitFromVoice(walk.id, today, c0.id);
  saveLocalJournal(today, {
    breakdown: flowchartFor(
      'Phone-first morning',
      'You’re trying Firnal on device — sample content so Home, Calendar, and Habits feel real.',
      t0,
      {
        commitments: ['Keep three sample days for demos'],
        decisions: ['Polish mobile before Phase 9 auth'],
        ideas: ['Make first-run less empty'],
        people: [{ name: 'Claire', initial: 'C' }],
        questions: ['What still feels awkward with one hand?'],
        mood: 'curious',
      },
    ),
    generatedAt: new Date().toISOString(),
    error: null,
  });

  localStorage.setItem(SEEDED_FLAG, '1');
  notifyCapturesChanged();
  notifyJournalChanged();
  notifyHabitsChanged();
  return { dates };
}

export function shouldAutoSeedSamples(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(SEEDED_FLAG) === '1') return false;
  return listLocalJournalDates().length === 0;
}
