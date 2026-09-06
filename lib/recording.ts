export const CAPTURES_CHANGED_EVENT = 'firnal:captures-changed';

export function notifyCapturesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CAPTURES_CHANGED_EVENT));
  }
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/mpeg',
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return '';
}
