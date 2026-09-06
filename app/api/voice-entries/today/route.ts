import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodayVoiceEntries } from '@/lib/voice-entries';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entries = await getTodayVoiceEntries(user.id);
    return NextResponse.json({ entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load entries';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
