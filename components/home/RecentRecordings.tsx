'use client';

import { useSyncExternalStore, useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  WifiOff,
  KeyRound,
  Upload,
  FileAudio,
} from 'lucide-react';
import { getLocalCapturesForDate } from '@/lib/local-captures';
import { CAPTURES_CHANGED_EVENT } from '@/lib/recording';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { VoiceEntry, ErrorCategory } from '@/lib/types/voice';
import { cn } from '@/lib/utils';
import { retryCapture } from '@/lib/api/uploadCapture';
import { toast } from 'sonner';

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
      entry.errorMessage !== b[index].errorMessage ||
      entry.errorCategory !== b[index].errorCategory
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

function getErrorIcon(category?: ErrorCategory) {
  switch (category) {
    case 'offline':
      return <WifiOff className="size-3" />;
    case 'api_key_missing':
      return <KeyRound className="size-3" />;
    case 'network':
      return <WifiOff className="size-3" />;
    default:
      return <AlertCircle className="size-3" />;
  }
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
      <p className="py-3 text-center text-sm text-muted-foreground">
        {isToday ? 'Hold the mic to capture a thought.' : 'No recordings for this day.'}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <RecordingItem key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}

function RecordingItem({ entry }: { entry: VoiceEntry }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;

    if (!navigator.onLine) {
      toast.error('Still offline — connect to retry');
      return;
    }

    setIsRetrying(true);
    try {
      await retryCapture(entry.id);
      toast.success('Transcription complete!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setIsRetrying(false);
    }
  }, [entry.id, isRetrying]);

  const showRetry =
    entry.status === 'failed' ||
    entry.status === 'queued' ||
    (entry.status === 'uploading' && !isRetrying);

  const canRetry = !isRetrying && navigator.onLine;

  return (
    <li className="rounded-xl border border-border/40 bg-card/80 px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {format(new Date(entry.recordedAt), 'h:mm a')}
        </span>
        <StatusBadge status={entry.status} isRetrying={isRetrying} />
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">
        {preview(entry.transcript, entry.status)}
      </p>

      {(entry.status === 'failed' || entry.status === 'queued') && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          {entry.status === 'queued' && !entry.errorMessage && (
            <span className="text-muted-foreground">Saved locally</span>
          )}
          {entry.errorMessage && (
            <span className="flex items-center gap-1 text-destructive">
              {getErrorIcon(entry.errorCategory)}
              {entry.errorMessage}
            </span>
          )}
          {showRetry && (
            <button
              onClick={handleRetry}
              disabled={!canRetry}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors',
                canRetry
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Retrying
                </>
              ) : (
                <>
                  <RefreshCw className="size-3" />
                  Retry
                </>
              )}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function preview(text: string | null, status: VoiceEntry['status']) {
  if (status === 'queued' || status === 'uploading') {
    return 'Waiting to transcribe…';
  }
  if (status === 'transcribing') {
    return 'Transcribing…';
  }
  if (!text) return '—';
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

function StatusBadge({
  status,
  isRetrying,
}: {
  status: VoiceEntry['status'];
  isRetrying?: boolean;
}) {
  const config: Record<
    VoiceEntry['status'],
    { label: string; icon: React.ReactNode; className: string }
  > = {
    queued: {
      label: 'Saved locally',
      icon: <FileAudio className="size-3" />,
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    uploading: {
      label: 'Uploading',
      icon: <Upload className="size-3 animate-pulse" />,
      className: 'bg-primary/10 text-primary',
    },
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

  if (isRetrying) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
        <Loader2 className="size-3 animate-spin" />
        Retrying
      </span>
    );
  }

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
