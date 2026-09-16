'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, RefreshCw, Mic } from 'lucide-react';
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
    {}
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
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
          <RefreshCw className="size-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={retry}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!breakdown) {
    return <EmptyFlowchart />;
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="px-0.5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{breakdown.title}</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
          {breakdown.summary}
        </p>
        {generatedAt && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3" />
            Updated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
            {generating && (
              <span className="inline-flex items-center gap-1">
                · <RefreshCw className="size-3 animate-spin" /> refreshing
              </span>
            )}
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
        AI sorted your thoughts into categories automatically
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

function EmptyFlowchart() {
  return (
    <div className="empty-state">
      <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Mic className="size-7 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">
        Hold the mic and talk — your day becomes a flowchart.
      </p>
    </div>
  );
}

function FlowchartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2 px-0.5">
        <Skeleton className="h-7 w-2/3 rounded-lg" />
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-4 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="size-4 animate-pulse text-primary" />
        <p className="text-sm text-muted-foreground">Building your flowchart…</p>
      </div>
    </div>
  );
}
