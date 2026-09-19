export type EntryStatus =
  | 'queued'
  | 'uploading'
  | 'pending'
  | 'transcribing'
  | 'transcribed'
  | 'failed';

export type ErrorCategory =
  | 'network'
  | 'offline'
  | 'api_key_missing'
  | 'openai_error'
  | 'mic_error'
  | 'unknown';

export type VoiceEntry = {
  id: string;
  recordedAt: string;
  transcript: string | null;
  status: EntryStatus;
  errorMessage: string | null;
  errorCategory?: ErrorCategory;
  durationMs: number | null;
  retryCount?: number;
};

export type TranscribeResponse = {
  entry: VoiceEntry;
};
