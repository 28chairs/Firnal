import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    year: searchParams.get('year'),
    month: searchParams.get('month'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 });
  }

  const { year, month } = parsed.data;
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEnd =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      return NextResponse.json({ dates: [] });
    }

    const { data: journals } = await supabase
      .from('daily_journals')
      .select('journal_date')
      .eq('user_id', user.id)
      .gte('journal_date', monthStart)
      .lt('journal_date', monthEnd);

    const dates = (journals ?? []).map((row) => row.journal_date as string);
    return NextResponse.json({ dates });
  } catch {
    return NextResponse.json({ dates: [] });
  }
}
