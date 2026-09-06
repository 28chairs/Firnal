import type { VoiceEntry } from '@/lib/types/voice';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import { formatInTimeZone } from 'date-fns-tz';

const STORAGE_KEY = 'firnal:voice-entries';

function readAll(): VoiceEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VoiceEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: VoiceEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getLocalCapturesForDate(date: string): VoiceEntry[] {
  const timezone = detectBrowserTimezone();

  return readAll()
    .filter((entry) => {
      const entryDay = formatInTimeZone(new Date(entry.recordedAt), timezone, 'yyyy-MM-dd');
      return entryDay === date;
    })
    .sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
}

export function getLocalCapturesForToday(): VoiceEntry[] {
  const timezone = detectBrowserTimezone();
  const today = getTodayDateString(timezone);
  return getLocalCapturesForDate(today);
}

export function addLocalCapture(entry: VoiceEntry) {
  const all = readAll();
  all.push(entry);
  writeAll(all);
}

export function updateLocalCapture(id: string, patch: Partial<VoiceEntry>) {
  const all = readAll().map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
  writeAll(all);
}

export function getLocalCapture(id: string): VoiceEntry | undefined {
  return readAll().find((entry) => entry.id === id);
}

/** For Phase 9: export local data to migrate after sign-in. */
export function getAllLocalCaptures(): VoiceEntry[] {
  return readAll();
}
