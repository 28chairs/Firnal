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
                className={`relative flex size-28 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-[0_8px_32px_rgba(225,29,72,0.35)] dark:shadow-[0_8px_32px_rgba(251,113,133,0.3)] transition-transform duration-200 ${
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
