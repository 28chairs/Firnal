import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transcribeAudio } from '@/lib/openai';
import { mapVoiceEntry } from '@/lib/voice-entries';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: entry, error: fetchError } = await supabase
    .from('voice_entries')
    .select('id, recorded_at, transcript, status, error_message, duration_ms, audio_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  if (!entry.audio_path) {
    return NextResponse.json({ error: 'No audio stored for retry' }, { status: 422 });
  }

  await supabase
    .from('voice_entries')
    .update({ status: 'transcribing', error_message: null })
    .eq('id', id);

  try {
    const admin = createAdminClient();
    const { data: fileData, error: downloadError } = await admin.storage
      .from('voice-audio')
      .download(entry.audio_path);

    if (downloadError || !fileData) {
      throw new Error(downloadError?.message ?? 'Could not load audio');
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const filename = entry.audio_path.split('/').pop() ?? 'capture.webm';
    const mimeType = fileData.type || 'audio/webm';
    const transcript = await transcribeAudio(buffer, filename, mimeType);

    const { data: updated, error: updateError } = await supabase
      .from('voice_entries')
      .update({ transcript, status: 'transcribed', error_message: null })
      .eq('id', id)
      .select('id, recorded_at, transcript, status, error_message, duration_ms')
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message ?? 'Failed to save transcript');
    }

    return NextResponse.json({ entry: mapVoiceEntry(updated) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Retry failed';
    await supabase
      .from('voice_entries')
      .update({ status: 'failed', error_message: message })
      .eq('id', id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
