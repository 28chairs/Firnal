'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from '@independo/capacitor-voice-recorder';
import { getSupportedMimeType } from '@/lib/recording';

const MAX_DURATION_MS = 180_000;

export type RecordingResult = {
  blob: Blob;
  durationMs: number;
  mimeType: string;
  recordedAt: string;
};

export type MediaRecorderError = 'permission_denied' | 'not_supported' | 'insecure_context' | 'unknown';

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

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
  const nativeModeRef = useRef(false);

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

  const startNativeRecording = useCallback(async () => {
    const can = await VoiceRecorder.canDeviceVoiceRecord();
    if (!can.value) {
      setError('not_supported');
      return false;
    }

    const permission = await VoiceRecorder.requestAudioRecordingPermission();
    if (!permission.value) {
      setError('permission_denied');
      return false;
    }

    await VoiceRecorder.startRecording();
    nativeModeRef.current = true;
    startedAtRef.current = Date.now();
    setDurationMs(0);
    setIsRecording(true);

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setDurationMs(elapsed);
      if (elapsed >= MAX_DURATION_MS) {
        options?.onMaxDuration?.();
      }
    }, 100);

    return true;
  }, [options]);

  const startWebRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('not_supported');
      return false;
    }

    if (!window.isSecureContext) {
      setError('insecure_context');
      return false;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('not_supported');
      return false;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    nativeModeRef.current = false;

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
  }, [cleanupStream, clearTimer, options]);

  const startRecording = useCallback(async () => {
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        return await startNativeRecording();
      }
      return await startWebRecording();
    } catch (err) {
      cleanupStream();
      clearTimer();
      setIsRecording(false);
      const name = err instanceof DOMException ? err.name : '';
      const message = err instanceof Error ? err.message : String(err);
      if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        message.includes('MISSING_PERMISSION')
      ) {
        setError('permission_denied');
      } else if (message.toLowerCase().includes('secure')) {
        setError('insecure_context');
      } else {
        setError('unknown');
      }
      return false;
    }
  }, [cleanupStream, clearTimer, startNativeRecording, startWebRecording]);

  const stopRecording = useCallback((): Promise<RecordingResult | null> => {
    return new Promise((resolve) => {
      void (async () => {
        clearTimer();

        if (nativeModeRef.current) {
          try {
            const { value } = await VoiceRecorder.stopRecording();
            nativeModeRef.current = false;
            setIsRecording(false);
            const mimeType = value.mimeType || 'audio/aac';
            const blob = base64ToBlob(value.recordDataBase64, mimeType);
            resolve({
              blob,
              durationMs: value.msDuration || Date.now() - startedAtRef.current,
              mimeType,
              recordedAt: new Date(startedAtRef.current).toISOString(),
            });
          } catch {
            nativeModeRef.current = false;
            setIsRecording(false);
            setError('unknown');
            resolve(null);
          }
          return;
        }

        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          resolve(null);
          return;
        }

        stopResolverRef.current = resolve;
        recorder.stop();
      })();
    });
  }, [clearTimer]);

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
