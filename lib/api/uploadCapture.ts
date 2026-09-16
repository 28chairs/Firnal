'use client';

import type { TranscribeResponse, ErrorCategory } from '@/lib/types/voice';
import { detectAndApplyHabits } from '@/lib/api/habits';
import {
  addLocalCapture,
  createDraftCapture,
  setUploadingStatus,
  setTranscribingStatus,
  setTranscribedStatus,
  setFailedStatus,
  setQueuedForRetry,
  getLocalCapture,
} from '@/lib/local-captures';
import {
  saveAudioDraft,
  deleteAudioDraft,
  getAudioDraft,
} from '@/lib/local-audio-store';
import { notifyCapturesChanged } from '@/lib/recording';

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_AUTO_RETRIES = 1;

export type CaptureError = {
  message: string;
  category: ErrorCategory;
  retryable: boolean;
};

function categorizeError(error: unknown, response?: Response): CaptureError {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const lowerMessage = message.toLowerCase();

  if (!navigator.onLine) {
    return {
      message: 'You\'re offline. Recording saved — will upload when you\'re back online.',
      category: 'offline',
      retryable: true,
    };
  }

  if (lowerMessage.includes('openai_api_key') || lowerMessage.includes('api key')) {
    return {
      message: 'OpenAI API key not configured. Recording saved locally.',
      category: 'api_key_missing',
      retryable: true,
    };
  }

  if (lowerMessage.includes('fetch') || lowerMessage.includes('network') || lowerMessage.includes('failed to fetch')) {
    return {
      message: 'Network error. Recording saved — tap Retry when connected.',
      category: 'network',
      retryable: true,
    };
  }

  if (response && response.status >= 500) {
    return {
      message: 'Server error. Recording saved — please try again.',
      category: 'openai_error',
      retryable: true,
    };
  }

  if (lowerMessage.includes('no speech') || lowerMessage.includes('speech')) {
    return {
      message: 'No speech detected in recording.',
      category: 'openai_error',
      retryable: false,
    };
  }

  if (lowerMessage.includes('openai') || lowerMessage.includes('transcription')) {
    return {
      message: 'Transcription failed. Recording saved — tap Retry.',
      category: 'openai_error',
      retryable: true,
    };
  }

  return {
    message: message || 'Something went wrong. Recording saved.',
    category: 'unknown',
    retryable: true,
  };
}

export function extensionForMime(mimeType: string) {
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'webm';
}

export async function saveDraftCapture(
  audio: Blob,
  recordedAt: string,
  durationMs: number
): Promise<string> {
  const id = crypto.randomUUID();

  await saveAudioDraft({
    id,
    blob: audio,
    mimeType: audio.type,
    recordedAt,
    durationMs,
    createdAt: Date.now(),
  });

  const draft = createDraftCapture(id, recordedAt, durationMs);
  addLocalCapture(draft);
  notifyCapturesChanged();

  return id;
}

export async function processCapture(captureId: string): Promise<TranscribeResponse> {
  const audioDraft = await getAudioDraft(captureId);
  if (!audioDraft) {
    throw new Error('Audio not found. Recording may have been deleted.');
  }

  const entry = getLocalCapture(captureId);
  const retryCount = entry?.retryCount ?? 0;

  if (audioDraft.blob.size > MAX_BYTES) {
    setFailedStatus(captureId, 'Recording is too large (max 25 MB)', 'unknown');
    throw new Error('Recording is too large (max 25 MB)');
  }

  if (!navigator.onLine) {
    const error = categorizeError(new Error('offline'));
    setFailedStatus(captureId, error.message, error.category);
    throw new Error(error.message);
  }

  setUploadingStatus(captureId);

  const formData = new FormData();
  formData.append(
    'audio',
    audioDraft.blob,
    `capture.${extensionForMime(audioDraft.mimeType)}`
  );
  formData.append('recordedAt', audioDraft.recordedAt);
  formData.append('durationMs', String(audioDraft.durationMs));
  formData.append('captureId', captureId);

  let response: Response | undefined;
  try {
    setTranscribingStatus(captureId);

    response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = payload.error ?? 'Upload failed';
      const errorInfo = categorizeError(new Error(errorMsg), response);

      if (errorInfo.retryable && errorInfo.category === 'network' && retryCount < MAX_AUTO_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setQueuedForRetry(captureId);
        return processCapture(captureId);
      }

      setFailedStatus(captureId, errorInfo.message, errorInfo.category);
      throw new Error(errorInfo.message);
    }

    const result = payload as TranscribeResponse;
    setTranscribedStatus(captureId, result.entry.transcript ?? '');

    await deleteAudioDraft(captureId);

    if (result.entry.transcript) {
      void detectAndApplyHabits(result.entry.id, result.entry.transcript);
    }

    return result;
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      const errorInfo = categorizeError(err, response);

      if (errorInfo.retryable && errorInfo.category === 'network' && retryCount < MAX_AUTO_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setQueuedForRetry(captureId);
        return processCapture(captureId);
      }

      setFailedStatus(captureId, errorInfo.message, errorInfo.category);
    } else if (!(err instanceof Error && err.message.includes('Recording'))) {
      const errorInfo = categorizeError(err, response);
      setFailedStatus(captureId, errorInfo.message, errorInfo.category);
    }
    throw err;
  }
}

export async function retryCapture(captureId: string): Promise<TranscribeResponse> {
  setQueuedForRetry(captureId);
  return processCapture(captureId);
}

export async function uploadCapture(
  audio: Blob,
  recordedAt: string,
  durationMs: number
): Promise<{ captureId: string; result?: TranscribeResponse; error?: CaptureError }> {
  const captureId = await saveDraftCapture(audio, recordedAt, durationMs);

  try {
    const result = await processCapture(captureId);
    return { captureId, result };
  } catch (err) {
    const errorInfo = categorizeError(err);
    return { captureId, error: errorInfo };
  }
}
