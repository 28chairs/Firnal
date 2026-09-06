'use client';

import type { MediaRecorderError } from '@/hooks/useMediaRecorder';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
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

      <div className="relative z-10 flex max-w-sm flex-col items-center gap-6 rounded-2xl bg-card px-8 py-10 shadow-xl">
        {micError ? (
          <MicErrorPanel error={micError} onClose={onClose} />
        ) : (
          <>
            <div
              className={`flex size-24 items-center justify-center rounded-full bg-fab text-fab-foreground ${
                status === 'recording' ? 'animate-pulse ring-4 ring-fab/30' : ''
              }`}
            >
              <MicIcon />
            </div>
            <p className="font-mono text-3xl tabular-nums text-foreground">{elapsedLabel}</p>
            <p className="text-center text-sm text-muted-foreground">
              {status === 'uploading'
                ? 'Uploading and transcribing…'
                : status === 'recording'
                  ? 'Release Space or the mic to stop'
                  : 'Hold Space or the mic to record'}
            </p>
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
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-lg font-semibold">Microphone access needed</h2>
      <p className="text-sm text-muted-foreground">
        {isPermission
          ? 'FIRNAL needs microphone permission to record your voice notes.'
          : 'Recording is not supported in this browser.'}
      </p>
      {isPermission && (
        <ul className="space-y-2 text-left text-xs text-muted-foreground">
          <li>
            <strong className="text-foreground">Chrome:</strong> Click the lock icon in the address
            bar → Site settings → Allow microphone.
          </li>
          <li>
            <strong className="text-foreground">Safari (iOS):</strong> Settings → Safari →
            Microphone → Allow for this site, or use the aA menu → Website Settings.
          </li>
        </ul>
      )}
      <button
        type="button"
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-10"
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
