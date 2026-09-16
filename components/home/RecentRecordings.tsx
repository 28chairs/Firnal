'use client';

import { useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getLocalCapturesForDate } from '@/lib/local-captures';
import { CAPTURES_CHANGED_EVENT } from '@/lib/recording';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { VoiceEntry } from '@/lib/types/voice';
import { cn } from '@/lib/utils';

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
      entry.errorMessage !== b[index].errorMessage
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
    getServerSnapshot
  );

  if (entries.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">
          {isToday
            ? 'No recordings yet today. Hold the mic and start talking.'
            : 'No recordings for this day.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="size-3" />
              {format(new Date(entry.recordedAt), 'h:mm a')}
            </span>
            <StatusBadge status={entry.status} />
          </div>
          <p className="text-sm leading-relaxed text-foreground">{preview(entry.transcript)}</p>
          {entry.status === 'failed' && entry.errorMessage && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3" />
              {entry.errorMessage}
            </p>
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
  const config: Record<
    VoiceEntry['status'],
    { label: string; icon: React.ReactNode; className: string }
  > = {
    pending: {
      label: 'Pending',
      icon: <Clock className="size-3" />,
      className: 'bg-muted text-muted-foreground',
    },
    transcribing: {
      label: 'Transcribing',
      icon: <Loader2 className="size-3 animate-spin" />,
      className: 'bg-primary/10 text-primary',
    },
    transcribed: {
      label: 'Done',
      icon: <CheckCircle2 className="size-3" />,
      className: 'bg-decisions/15 text-decisions',
    },
    failed: {
      label: 'Failed',
      icon: <AlertCircle className="size-3" />,
      className: 'bg-destructive/10 text-destructive',
    },
  };

  const { label, icon, className } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium',
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
