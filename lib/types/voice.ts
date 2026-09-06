export type EntryStatus = 'pending' | 'transcribing' | 'transcribed' | 'failed';

export type VoiceEntry = {
  id: string;
  recordedAt: string;
  transcript: string | null;
  status: EntryStatus;
  errorMessage: string | null;
  durationMs: number | null;
};

export type TranscribeResponse = {
  entry: VoiceEntry;
};
