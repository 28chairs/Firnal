'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { BottomNav } from '@/components/navigation/BottomNav';
import { RecordingOverlay } from '@/components/navigation/RecordingOverlay';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { uploadCapture } from '@/lib/api/uploadCapture';
import { notifyCapturesChanged, formatElapsed } from '@/lib/recording';

const MIN_DURATION_MS = 1000;

type HoldSource = 'pointer' | 'keyboard';

function shouldIgnoreKeyboardRecording(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;

  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'idle' | 'recording' | 'uploading'>('idle');
  const holdSourceRef = useRef<HoldSource | null>(null);
  const overlayStatusRef = useRef(overlayStatus);

  useEffect(() => {
    overlayStatusRef.current = overlayStatus;
  }, [overlayStatus]);

  const handleMaxDuration = useCallback(() => {
    toast.message('Maximum recording length reached (3 minutes)');
  }, []);

  const { startRecording, stopRecording, isRecording, durationMs, error, resetError } =
    useMediaRecorder({ onMaxDuration: handleMaxDuration });

  const closeOverlay = useCallback(() => {
    if (overlayStatusRef.current === 'uploading') return;
    setOverlayOpen(false);
    setOverlayStatus('idle');
    resetError();
  }, [resetError]);

  const finalizeRecording = useCallback(async () => {
    const result = await stopRecording();

    if (!result) {
      closeOverlay();
      return;
    }

    if (result.durationMs < MIN_DURATION_MS) {
      toast.error('Recording too short — hold for at least 1 second');
      closeOverlay();
      return;
    }

    setOverlayStatus('uploading');

    try {
      await uploadCapture(result.blob, result.recordedAt, result.durationMs);
      toast.success('Transcribing…');
      notifyCapturesChanged();
      setOverlayOpen(false);
      setOverlayStatus('idle');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      closeOverlay();
    }
  }, [closeOverlay, stopRecording]);

  const beginRecording = useCallback(
    async (source: HoldSource) => {
      if (overlayStatusRef.current === 'uploading' || holdSourceRef.current) return;

      holdSourceRef.current = source;
      resetError();
      setOverlayOpen(true);
      setOverlayStatus('recording');

      const started = await startRecording();
      if (!started) {
        holdSourceRef.current = null;
        setOverlayStatus('idle');
      }
    },
    [resetError, startRecording],
  );

  const endRecording = useCallback(
    async (source: HoldSource) => {
      if (holdSourceRef.current !== source) return;
      holdSourceRef.current = null;

      if (error) {
        return;
      }

      if (isRecording || overlayStatusRef.current === 'recording') {
        await finalizeRecording();
      } else {
        closeOverlay();
      }
    },
    [closeOverlay, error, finalizeRecording, isRecording],
  );

  const handleFabPointerDown = useCallback(() => {
    void beginRecording('pointer');
  }, [beginRecording]);

  const handleFabPointerUp = useCallback(() => {
    void endRecording('pointer');
  }, [endRecording]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      if (event.repeat) return;
      if (shouldIgnoreKeyboardRecording(event)) return;
      if (overlayStatusRef.current === 'uploading') return;

      event.preventDefault();
      void beginRecording('keyboard');
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      if (holdSourceRef.current !== 'keyboard') return;

      event.preventDefault();
      void endRecording('keyboard');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [beginRecording, endRecording]);

  useEffect(() => {
    if (!overlayOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlayOpen]);

  return (
    <>
      <div className="flex min-h-screen flex-col pb-20">{children}</div>
      <BottomNav
        onFabPointerDown={handleFabPointerDown}
        onFabPointerUp={handleFabPointerUp}
        onFabPointerLeave={handleFabPointerUp}
        isRecording={isRecording}
        disabled={overlayStatus === 'uploading'}
      />
      <RecordingOverlay
        isOpen={overlayOpen}
        onClose={closeOverlay}
        status={overlayStatus}
        elapsedLabel={formatElapsed(durationMs)}
        micError={error}
      />
    </>
  );
}
