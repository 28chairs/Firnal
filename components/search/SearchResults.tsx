'use client';

import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import type { SearchResult } from '@/lib/types/search';
import { detectBrowserTimezone } from '@/lib/timezone';

type SearchResultsProps = {
  query: string;
  results: SearchResult[];
  loading?: boolean;
};

function renderSnippet(snippet: string) {
  const parts = snippet.split(/<<mark>>|<<\/mark>>/);
  return parts.map((part, index) => {
    if (!part) return null;
    if (index % 2 === 1) {
      return (
        <mark key={index} className="rounded bg-primary/20 px-0.5 text-foreground">
          {part}
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function SearchResults({ query, results, loading = false }: SearchResultsProps) {
  const timezone = detectBrowserTimezone();

  if (query.trim().length < 2) {
    return (
      <p className="px-0.5 text-sm text-muted-foreground">
        Type at least 2 characters to search recordings and flowcharts.
      </p>
    );
  }

  if (loading) {
    return <p className="px-0.5 text-sm text-muted-foreground">Searching…</p>;
  }

  if (results.length === 0) {
    return (
      <p className="px-0.5 text-sm text-muted-foreground">
        No matches for &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {results.map((result) => {
        const label = formatInTimeZone(
          new Date(`${result.date}T12:00:00`),
          timezone,
          'EEE, MMM d, yyyy',
        );

        return (
          <li key={`${result.date}-${result.matchSource}-${result.title}`}>
            <Link
              href={`/calendar/${result.date}`}
              className="block rounded-2xl border border-black/[0.04] bg-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-primary/20 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {result.matchSource === 'voice' ? 'Recording' : 'Flowchart'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {renderSnippet(result.snippet)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
