'use client';

import type { MediaRecorderError } from '@/hooks/useMediaRecorder';
import { cn } from '@/lib/utils';

type RecordingOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  status: 'idle' | 'recording' | 'uploading';
  elapsedLabel?: string;
  micError?: MediaRecorderError | null;
};

export function RecordingOverlay({
  isOpen,
  onClose,
  status,
  elapsedLabel = '00:00',
  micError,
}: RecordingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Recording"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close recording overlay"
        onClick={status === 'uploading' ? undefined : onClose}
        disabled={status === 'uploading'}
      />

      <div className="relative z-10 flex max-w-sm flex-col items-center gap-6 rounded-3xl bg-card px-8 py-10 shadow-2xl ring-1 ring-black/5 transition-transform duration-200">
        {micError ? (
          <MicErrorPanel error={micError} onClose={onClose} />
        ) : (
          <>
            <div
              className={cn(
                'flex size-28 items-center justify-center rounded-full bg-fab text-fab-foreground transition-all duration-300',
                status === 'recording' && 'fab-glow animate-pulse scale-105 ring-4 ring-fab/25',
                status === 'uploading' && 'opacity-80'
              )}
            >
              <MicIcon
                className={cn(
                  'transition-transform duration-200',
                  status === 'recording' && 'scale-110'
                )}
              />
            </div>

            <div className="text-center">
              <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                {elapsedLabel}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {status === 'uploading'
                  ? 'Processing…'
                  : status === 'recording'
                    ? 'Release to stop'
                    : 'Hold to record'}
              </p>
            </div>

            {status === 'uploading' && (
              <div className="flex items-center gap-2">
                <div className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Saving your recording</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MicErrorPanel({
  error,
  onClose,
}: {
  error: MediaRecorderError;
  onClose: () => void;
}) {
  const isPermission = error === 'permission_denied';

  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 text-destructive"
        >
          <line x1="1" x2="23" y1="1" y2="23" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Microphone access needed</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPermission
            ? 'FIRNAL needs microphone permission to record your voice notes.'
            : 'Recording is not supported in this browser.'}
        </p>
      </div>

      {isPermission && (
        <ul className="space-y-2.5 rounded-xl bg-muted/50 p-4 text-left text-xs text-muted-foreground">
          <li>
            <strong className="text-foreground">Chrome:</strong> Click the lock icon in the address
            bar → Site settings → Allow microphone.
          </li>
          <li>
            <strong className="text-foreground">Safari (iOS):</strong> Settings → Safari →
            Microphone → Allow for this site.
          </li>
        </ul>
      )}

      <button
        type="button"
        className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        onClick={onClose}
      >
        Got it
      </button>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-12', className)}
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
