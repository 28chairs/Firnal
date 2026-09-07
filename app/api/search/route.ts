import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { SearchMatchSource, SearchResult } from '@/lib/types/search';

const querySchema = z.object({
  q: z.string().trim().min(2).max(200),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ q: searchParams.get('q') ?? '' });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const query = parsed.data.q;

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      return NextResponse.json({ results: [] satisfies SearchResult[] });
    }

    const { data: voiceRows } = await supabase
      .from('voice_entries')
      .select('id, recorded_at, transcript')
      .eq('user_id', user.id)
      .textSearch('search_vector', query, { type: 'plain', config: 'english' })
      .limit(20);

    const voiceResults: SearchResult[] = (voiceRows ?? []).map((row) => ({
      date: row.recorded_at.slice(0, 10),
      title: `Recording · ${row.recorded_at.slice(0, 10)}`,
      snippet: buildPlainSnippet(row.transcript ?? '', query),
      matchSource: 'voice' satisfies SearchMatchSource,
    }));

    const { data: journalRows } = await supabase
      .from('daily_journals')
      .select('journal_date, structured')
      .eq('user_id', user.id)
      .textSearch('search_vector', query, { type: 'plain', config: 'english' })
      .limit(20);

    const journalResults: SearchResult[] = (journalRows ?? []).map((row) => {
      const structured = row.structured as { title?: string; summary?: string } | null;
      const text = [structured?.title, structured?.summary].filter(Boolean).join(' · ');
      return {
        date: row.journal_date,
        title: structured?.title ?? row.journal_date,
        snippet: buildPlainSnippet(text || JSON.stringify(row.structured ?? {}), query),
        matchSource: 'journal' satisfies SearchMatchSource,
      };
    });

    return NextResponse.json({
      results: dedupeResults([...voiceResults, ...journalResults]),
    });
  } catch {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }
}

function buildPlainSnippet(text: string, query: string, radius = 60): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) return text.slice(0, radius * 2);
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + query.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  const snippet = `${prefix}${text.slice(start, end)}${suffix}`;
  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return snippet.replace(pattern, '<<mark>>$1<</mark>>');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dedupeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];

  for (const result of results.sort((a, b) => b.date.localeCompare(a.date))) {
    const key = `${result.date}:${result.matchSource}:${result.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }

  return deduped;
}
