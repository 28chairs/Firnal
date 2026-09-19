import type { VoiceEntry, ErrorCategory } from '@/lib/types/voice';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import { formatInTimeZone } from 'date-fns-tz';
import { notifyCapturesChanged } from '@/lib/recording';

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

export function createDraftCapture(
  id: string,
  recordedAt: string,
  durationMs: number | null
): VoiceEntry {
  return {
    id,
    recordedAt,
    transcript: null,
    status: 'queued',
    errorMessage: null,
    errorCategory: undefined,
    durationMs,
    retryCount: 0,
  };
}

export function setUploadingStatus(id: string) {
  const all = readAll().map((entry) =>
    entry.id === id ? { ...entry, status: 'uploading' as const, errorMessage: null, errorCategory: undefined } : entry
  );
  writeAll(all);
  notifyCapturesChanged();
}

export function setTranscribingStatus(id: string) {
  const all = readAll().map((entry) =>
    entry.id === id ? { ...entry, status: 'transcribing' as const } : entry
  );
  writeAll(all);
  notifyCapturesChanged();
}

export function setTranscribedStatus(id: string, transcript: string) {
  const all = readAll().map((entry) =>
    entry.id === id
      ? { ...entry, status: 'transcribed' as const, transcript, errorMessage: null, errorCategory: undefined }
      : entry
  );
  writeAll(all);
  notifyCapturesChanged();
}

export function setFailedStatus(
  id: string,
  errorMessage: string,
  errorCategory: ErrorCategory
) {
  const all = readAll().map((entry) =>
    entry.id === id
      ? {
          ...entry,
          status: 'failed' as const,
          errorMessage,
          errorCategory,
          retryCount: (entry.retryCount ?? 0) + 1,
        }
      : entry
  );
  writeAll(all);
  notifyCapturesChanged();
}

export function setQueuedForRetry(id: string) {
  const all = readAll().map((entry) =>
    entry.id === id
      ? { ...entry, status: 'queued' as const, errorMessage: null, errorCategory: undefined }
      : entry
  );
  writeAll(all);
  notifyCapturesChanged();
}

export function getFailedCaptures(): VoiceEntry[] {
  return readAll().filter((entry) => entry.status === 'failed');
}

export function getQueuedCaptures(): VoiceEntry[] {
  return readAll().filter((entry) => entry.status === 'queued');
}

export function getPendingCaptures(): VoiceEntry[] {
  return readAll().filter(
    (entry) => entry.status === 'queued' || entry.status === 'uploading' || entry.status === 'transcribing'
  );
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
  notifyCapturesChanged();
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
