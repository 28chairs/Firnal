'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupportedMimeType } from '@/lib/recording';

const MAX_DURATION_MS = 180_000;

export type RecordingResult = {
  blob: Blob;
  durationMs: number;
  mimeType: string;
  recordedAt: string;
};

export type MediaRecorderError = 'permission_denied' | 'not_supported' | 'unknown';

export function useMediaRecorder(options?: { onMaxDuration?: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<MediaRecorderError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const stopResolverRef = useRef<((result: RecordingResult | null) => void) | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      cleanupStream();
    };
  }, [clearTimer, cleanupStream]);

  const startRecording = useCallback(async () => {
    setError(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('not_supported');
      return false;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('not_supported');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setDurationMs(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        clearTimer();
        const elapsed = Date.now() - startedAtRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanupStream();
        setIsRecording(false);
        stopResolverRef.current?.({
          blob,
          durationMs: elapsed,
          mimeType,
          recordedAt: new Date(startedAtRef.current).toISOString(),
        });
        stopResolverRef.current = null;
      };

      recorder.onerror = () => {
        setError('unknown');
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setDurationMs(elapsed);

        if (elapsed >= MAX_DURATION_MS) {
          options?.onMaxDuration?.();
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 100);

      return true;
    } catch (err) {
      cleanupStream();
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('permission_denied');
      } else {
        setError('unknown');
      }
      return false;
    }
  }, [cleanupStream, clearTimer, options]);

  const stopRecording = useCallback((): Promise<RecordingResult | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      stopResolverRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return {
    startRecording,
    stopRecording,
    isRecording,
    durationMs,
    error,
    resetError,
  };
}
