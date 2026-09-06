import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transcribeAudio } from '@/lib/openai';
import { mapVoiceEntry } from '@/lib/voice-entries';
import type { VoiceEntry } from '@/lib/types/voice';

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const audio = formData.get('audio');
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
  }

  if (audio.size === 0) {
    return NextResponse.json({ error: 'No speech detected' }, { status: 422 });
  }

  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 });
  }

  const recordedAtRaw = formData.get('recordedAt');
  const durationMsRaw = formData.get('durationMs');
  const recordedAt =
    typeof recordedAtRaw === 'string' ? recordedAtRaw : new Date().toISOString();
  const durationMs =
    typeof durationMsRaw === 'string' ? Number.parseInt(durationMsRaw, 10) : null;

  const entryId = crypto.randomUUID();
  const buffer = Buffer.from(await audio.arrayBuffer());
  const mimeType = audio.type || 'audio/webm';
  const extension = audio.name.split('.').pop() ?? 'webm';

  let user: { id: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase not configured — local-only mode (Phase 9 adds auth + cloud sync)
  }

  if (user) {
    return transcribeWithDatabase({
      userId: user.id,
      entryId,
      recordedAt,
      durationMs,
      buffer,
      mimeType,
      extension,
      filename: audio.name || `capture.${extension}`,
    });
  }

  return transcribeLocalOnly({
    entryId,
    recordedAt,
    durationMs,
    buffer,
    mimeType,
    filename: audio.name || `capture.${extension}`,
  });
}

async function transcribeLocalOnly({
  entryId,
  recordedAt,
  durationMs,
  buffer,
  mimeType,
  filename,
}: {
  entryId: string;
  recordedAt: string;
  durationMs: number | null;
  buffer: Buffer;
  mimeType: string;
  filename: string;
}) {
  try {
    const transcript = await transcribeAudio(buffer, filename, mimeType);
    const entry: VoiceEntry = {
      id: entryId,
      recordedAt,
      transcript,
      status: 'transcribed',
      errorMessage: null,
      durationMs: Number.isFinite(durationMs) ? durationMs : null,
    };
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    const isNoSpeech = message.toLowerCase().includes('no speech');
    return NextResponse.json({ error: message }, { status: isNoSpeech ? 422 : 500 });
  }
}

async function transcribeWithDatabase({
  userId,
  entryId,
  recordedAt,
  durationMs,
  buffer,
  mimeType,
  extension,
  filename,
}: {
  userId: string;
  entryId: string;
  recordedAt: string;
  durationMs: number | null;
  buffer: Buffer;
  mimeType: string;
  extension: string;
  filename: string;
}) {
  const supabase = await createClient();

  const { data: entry, error: insertError } = await supabase
    .from('voice_entries')
    .insert({
      id: entryId,
      user_id: userId,
      recorded_at: recordedAt,
      status: 'transcribing',
      duration_ms: Number.isFinite(durationMs) ? durationMs : null,
    })
    .select('id, recorded_at, transcript, status, error_message, duration_ms')
    .single();

  if (insertError || !entry) {
    return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 });
  }

  const storagePath = `${userId}/${entry.id}.${extension}`;

  try {
    try {
      const admin = createAdminClient();
      await admin.storage.from('voice-audio').upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });
      await supabase.from('voice_entries').update({ audio_path: storagePath }).eq('id', entry.id);
    } catch {
      // Storage optional
    }

    const transcript = await transcribeAudio(buffer, filename, mimeType);

    const { data: updated, error: updateError } = await supabase
      .from('voice_entries')
      .update({
        transcript,
        status: 'transcribed',
        error_message: null,
      })
      .eq('id', entry.id)
      .select('id, recorded_at, transcript, status, error_message, duration_ms')
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message ?? 'Failed to save transcript');
    }

    return NextResponse.json({ entry: mapVoiceEntry(updated) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    const isNoSpeech = message.toLowerCase().includes('no speech');

    await supabase
      .from('voice_entries')
      .update({
        status: 'failed',
        error_message: message,
      })
      .eq('id', entry.id);

    return NextResponse.json({ error: message }, { status: isNoSpeech ? 422 : 500 });
  }
}
