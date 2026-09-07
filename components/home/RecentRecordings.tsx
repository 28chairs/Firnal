'use client';

import { useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import { getLocalCapturesForDate } from '@/lib/local-captures';
import { CAPTURES_CHANGED_EVENT } from '@/lib/recording';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { VoiceEntry } from '@/lib/types/voice';

type RecentRecordingsProps = {
  date?: string;
};

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CAPTURES_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(CAPTURES_CHANGED_EVENT, onStoreChange);
}

const EMPTY_ENTRIES: VoiceEntry[] = [];
const snapshotByDate = new Map<string, VoiceEntry[]>();

function entriesChanged(a: VoiceEntry[], b: VoiceEntry[]) {
  if (a.length !== b.length) return true;
  return a.some(
    (entry, index) =>
      entry.id !== b[index].id ||
      entry.status !== b[index].status ||
      entry.transcript !== b[index].transcript ||
      entry.errorMessage !== b[index].errorMessage,
  );
}

function getClientSnapshotForDate(date: string) {
  const next = getLocalCapturesForDate(date);
  const cached = snapshotByDate.get(date);
  if (cached && !entriesChanged(cached, next)) {
    return cached;
  }
  snapshotByDate.set(date, next);
  return next;
}

function getServerSnapshot() {
  return EMPTY_ENTRIES;
}

export function RecentRecordings({ date }: RecentRecordingsProps) {
  const timezone = detectBrowserTimezone();
  const resolvedDate = date ?? getTodayDateString(timezone);
  const isToday = resolvedDate === getTodayDateString(timezone);

  const entries = useSyncExternalStore(
    subscribe,
    () => getClientSnapshotForDate(resolvedDate),
    getServerSnapshot,
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {isToday
          ? 'No captures yet today. Hold the mic button and tell me about your day.'
          : 'No recordings for this day.'}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-2xl border border-black/[0.04] bg-card p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {format(new Date(entry.recordedAt), 'h:mm a')}
            </span>
            <StatusBadge status={entry.status} />
          </div>
          <p className="text-sm leading-relaxed text-foreground">{preview(entry.transcript)}</p>
          {entry.status === 'failed' && entry.errorMessage && (
            <p className="mt-2 text-xs text-destructive">{entry.errorMessage}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function preview(text: string | null) {
  if (!text) return '—';
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

function StatusBadge({ status }: { status: VoiceEntry['status'] }) {
  const labels: Record<VoiceEntry['status'], string> = {
    pending: 'Pending',
    transcribing: 'Transcribing',
    transcribed: 'Done',
    failed: 'Failed',
  };

  const colors: Record<VoiceEntry['status'], string> = {
    pending: 'bg-muted text-muted-foreground',
    transcribing: 'bg-ideas/15 text-ideas',
    transcribed: 'bg-decisions/15 text-decisions',
    failed: 'bg-destructive/10 text-destructive',
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
