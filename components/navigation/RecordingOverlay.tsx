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

  const isRecording = status === 'recording';
  const isUploading = status === 'uploading';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recording"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close recording overlay"
        onClick={isUploading ? undefined : onClose}
        disabled={isUploading}
      />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-8 rounded-3xl bg-card/95 px-8 py-12 shadow-2xl backdrop-blur-md">
        {micError ? (
          <MicErrorPanel error={micError} onClose={onClose} />
        ) : (
          <>
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <span className="absolute size-28 rounded-full bg-fab/40 animate-pulse-ring" />
                  <span className="absolute size-28 rounded-full bg-fab/25 animate-pulse-ring-slow" />
                  <span
                    className="absolute size-28 rounded-full bg-fab/15 animate-pulse-ring"
                    style={{ animationDelay: '0.5s' }}
                  />
                </>
              )}
              {isUploading && (
                <span className="absolute size-32 rounded-full border-4 border-fab/20 border-t-fab animate-spin" />
              )}
              <div
                className={`relative flex size-28 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-[0_8px_32px_rgba(196,91,108,0.35)] dark:shadow-[0_8px_32px_rgba(212,132,144,0.3)] transition-transform duration-200 ${
                  isRecording ? 'scale-105 animate-mic-glow' : ''
                } ${isUploading ? 'opacity-80' : ''}`}
              >
                <MicIcon />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-foreground">
                {elapsedLabel}
              </p>
              <p className="text-center text-sm font-medium text-muted-foreground">
                {isUploading
                  ? 'Processing your note…'
                  : isRecording
                    ? 'Release to stop'
                    : 'Hold to record'}
              </p>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-fab animate-pulse" />
                <span>Uploading and transcribing</span>
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
