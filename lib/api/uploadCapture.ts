'use client';

import type { TranscribeResponse } from '@/lib/types/voice';
import { detectAndApplyHabits } from '@/lib/api/habits';
import { addLocalCapture } from '@/lib/local-captures';

const MAX_BYTES = 25 * 1024 * 1024;

export async function uploadCapture(
  audio: Blob,
  recordedAt: string,
  durationMs: number
): Promise<TranscribeResponse> {
  if (audio.size > MAX_BYTES) {
    throw new Error('Recording is too large (max 25 MB)');
  }

  const formData = new FormData();
  formData.append('audio', audio, `capture.${extensionForMime(audio.type)}`);
  formData.append('recordedAt', recordedAt);
  formData.append('durationMs', String(durationMs));

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? 'Upload failed');
  }

  const result = payload as TranscribeResponse;
  addLocalCapture(result.entry);

  if (result.entry.transcript) {
    void detectAndApplyHabits(result.entry.id, result.entry.transcript);
  }

  return result;
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'webm';
}
