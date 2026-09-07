'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CategoryGrid } from '@/components/home/CategoryColumn';
import { ConnectorLines } from '@/components/home/ConnectorLines';
import { TranscriptPanel, type SpanRefMap } from '@/components/home/TranscriptPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDayJournal } from '@/hooks/useDayJournal';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import type { CategoryKey } from '@/lib/categories';

export function DayFlowchart({ date }: { date?: string }) {
  const timezone = detectBrowserTimezone();
  const resolvedDate = date ?? getTodayDateString(timezone);
  const { breakdown, generatedAt, error, generating, retry } = useDayJournal(resolvedDate);

  const containerRef = useRef<HTMLDivElement>(null);
  const spanRefsRef = useRef<SpanRefMap>(new Map());

  useEffect(() => {
    spanRefsRef.current.clear();
  }, [breakdown]);
  const [columnRefs, setColumnRefs] = useState<Partial<Record<CategoryKey, HTMLElement | null>>>(
    {},
  );

  const setColumnRef = (category: CategoryKey) => (el: HTMLElement | null) => {
    setColumnRefs((prev) => {
      if (prev[category] === el) return prev;
      return { ...prev, [category]: el };
    });
  };

  if (generating && !breakdown) {
    return <FlowchartSkeleton />;
  }

  if (error && !breakdown) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
          Retry breakdown
        </Button>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="rounded-2xl border border-dashed border-black/[0.08] bg-card/50 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Record a voice note and your day will appear here as a flowchart.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="px-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{breakdown.title}</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
          {breakdown.summary}
        </p>
        {generatedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
            {generating ? ' · refreshing…' : ''}
          </p>
        )}
      </header>

      <div ref={containerRef} className="relative flex flex-col gap-4 md:flex-row md:gap-6">
        <ConnectorLines
          containerRef={containerRef}
          spanRefsRef={spanRefsRef}
          columnRefs={columnRefs}
          spans={breakdown.spans}
        />

        <div className="md:w-[42%] md:shrink-0">
          <TranscriptPanel
            text={breakdown.mergedTranscript}
            spans={breakdown.spans}
            spanRefsRef={spanRefsRef}
          />
        </div>

        <div className="md:min-w-0 md:flex-1">
          <CategoryGrid
            breakdown={breakdown}
            columnRefs={{
              commitments: setColumnRef('commitments'),
              decisions: setColumnRef('decisions'),
              ideas: setColumnRef('ideas'),
              people: setColumnRef('people'),
              questions: setColumnRef('questions'),
            }}
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        You didn&apos;t tag anything — AI sorted your day into categories.
      </p>

      {error && (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retry}>
            Retry breakdown
          </Button>
        </div>
      )}
    </section>
  );
}

function FlowchartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <p className="text-center text-xs text-muted-foreground">Building your flowchart…</p>
    </div>
  );
}
