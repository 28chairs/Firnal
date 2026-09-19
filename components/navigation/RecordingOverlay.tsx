'use client';

import { useEffect, useRef, useCallback } from 'react';
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'uploading') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onClose, status]
  );

  if (!isOpen) return null;

  const isRecording = status === 'recording';
  const isUploading = status === 'uploading';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recording"
      onKeyDown={handleKeyDown}
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
              <p className="text-center text-sm text-muted-foreground">
                {isUploading
                  ? 'Processing…'
                  : isRecording
                    ? 'Release to stop'
                    : 'Hold to record'}
              </p>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-fab animate-pulse" />
                <span>Saving your recording</span>
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
  const copy =
    error === 'permission_denied'
      ? {
          title: 'Microphone access needed',
          body: 'Allow microphone access for FIRNAL, then hold the button again.',
          tips: [
            'On iPhone: Settings → FIRNAL → Microphone → On',
            'If you denied once, toggle Microphone off/on, then reopen FIRNAL.',
          ],
        }
      : error === 'insecure_context'
        ? {
            title: 'Recording blocked in this browser',
            body: 'Browsers only allow the mic on HTTPS or localhost. Use the FIRNAL iPhone app for recording.',
            tips: [] as string[],
          }
        : {
            title: 'Recording not available',
            body: 'This device could not start the microphone.',
            tips: [] as string[],
          };

  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <MicIcon className="size-8 text-destructive" />
      </div>

      <div>
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>
      </div>

      {copy.tips.length > 0 && (
        <ul className="space-y-2.5 rounded-xl bg-muted/50 p-4 text-left text-xs text-muted-foreground">
          {copy.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="min-h-11 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
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
