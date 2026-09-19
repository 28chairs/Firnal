'use client';

import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import { Mic2, Sparkles, FileSearch } from 'lucide-react';
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
        <mark
          key={index}
          className="rounded-sm bg-primary/20 px-0.5 font-medium text-foreground"
        >
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
      <div className="empty-state py-8">
        <FileSearch className="mx-auto mb-3 size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Type at least 2 characters to search recordings and flowcharts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <p className="text-sm text-muted-foreground">Searching…</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty-state py-8">
        <FileSearch className="mx-auto mb-3 size-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No matches found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try searching for different keywords
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {results.map((result) => {
        const label = formatInTimeZone(
          new Date(`${result.date}T12:00:00`),
          timezone,
          'EEE, MMM d, yyyy'
        );
        const isVoice = result.matchSource === 'voice';

        return (
          <li key={`${result.date}-${result.matchSource}-${result.title}`}>
            <Link
              href={`/calendar/${result.date}`}
              className="block rounded-2xl border-2 border-border/60 bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {result.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  {isVoice ? (
                    <>
                      <Mic2 className="size-3" />
                      Recording
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3" />
                      Flowchart
                    </>
                  )}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {renderSnippet(result.snippet)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
