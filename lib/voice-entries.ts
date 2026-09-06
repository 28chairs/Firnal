import { createClient } from '@/lib/supabase/server';
import { getDayBounds, getTodayDateString } from '@/lib/timezone';
import type { VoiceEntry } from '@/lib/types/voice';

export async function getUserTimezone(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('timezone').eq('id', userId).single();
  return data?.timezone ?? 'UTC';
}

export function mapVoiceEntry(row: {
  id: string;
  recorded_at: string;
  transcript: string | null;
  status: VoiceEntry['status'];
  error_message: string | null;
  duration_ms: number | null;
}): VoiceEntry {
  return {
    id: row.id,
    recordedAt: row.recorded_at,
    transcript: row.transcript,
    status: row.status,
    errorMessage: row.error_message,
    durationMs: row.duration_ms,
  };
}

export async function getTodayVoiceEntries(userId: string): Promise<VoiceEntry[]> {
  const supabase = await createClient();
  const timezone = await getUserTimezone(userId);
  const today = getTodayDateString(timezone);
  const { startUtc, endUtc } = getDayBounds(today, timezone);

  const { data, error } = await supabase
    .from('voice_entries')
    .select('id, recorded_at, transcript, status, error_message, duration_ms')
    .eq('user_id', userId)
    .gte('recorded_at', startUtc.toISOString())
    .lte('recorded_at', endUtc.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapVoiceEntry);
}
