import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateDailyFlowchart } from '@/lib/flowchart';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  transcripts: z
    .array(
      z.object({
        recordedAt: z.string(),
        transcript: z.string().min(1),
      }),
    )
    .min(1),
  habitNames: z.array(z.string()).optional(),
});

type RouteContext = { params: Promise<{ date: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { date } = await context.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const breakdown = await generateDailyFlowchart(
      body.transcripts,
      body.habitNames ?? [],
    );
    const generatedAt = new Date().toISOString();

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;

      if (userId) {
        await supabase.from('daily_journals').upsert(
          {
            user_id: userId,
            journal_date: date,
            structured: breakdown,
            generated_at: generatedAt,
          },
          { onConflict: 'user_id,journal_date' },
        );
      }
    } catch {
      // Supabase optional until Phase 9
    }

    return NextResponse.json({ date, breakdown, generatedAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { date } = await context.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      return NextResponse.json({
        date,
        entries: [],
        breakdown: null,
        generatedAt: null,
      });
    }

    const { data: journal } = await supabase
      .from('daily_journals')
      .select('structured, generated_at')
      .eq('user_id', user.id)
      .eq('journal_date', date)
      .maybeSingle();

    const { data: entries } = await supabase
      .from('voice_entries')
      .select('id, recorded_at, transcript, status, error_message, duration_ms')
      .eq('user_id', user.id)
      .gte('recorded_at', `${date}T00:00:00`)
      .lte('recorded_at', `${date}T23:59:59`)
      .order('recorded_at', { ascending: true });

    return NextResponse.json({
      date,
      entries: entries ?? [],
      breakdown: journal?.structured ?? null,
      generatedAt: journal?.generated_at ?? null,
    });
  } catch {
    return NextResponse.json({
      date,
      entries: [],
      breakdown: null,
      generatedAt: null,
    });
  }
}
