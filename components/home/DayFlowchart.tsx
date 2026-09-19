'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, RefreshCw, Mic } from 'lucide-react';
import { CategoryGrid } from '@/components/home/CategoryColumn';
import { ConnectorLines } from '@/components/home/ConnectorLines';
import { DayTimeline } from '@/components/home/DayTimeline';
import { TranscriptPanel, type SpanRefMap } from '@/components/home/TranscriptPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDayJournal } from '@/hooks/useDayJournal';
import { useTodayEvents } from '@/hooks/useTodayEvents';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';
import { OFFLINE_ERROR } from '@/lib/flowchart';
import type { CategoryKey } from '@/lib/categories';

export function DayFlowchart({ date }: { date?: string }) {
  const timezone = detectBrowserTimezone();
  const resolvedDate = date ?? getTodayDateString(timezone);
  const { breakdown, generatedAt, error, generating, retry } = useDayJournal(resolvedDate);
  const { events, connected, loading: eventsLoading } = useTodayEvents();

  const containerRef = useRef<HTMLDivElement>(null);
  const spanRefsRef = useRef<SpanRefMap>(new Map());
  const [showDesktopTranscript, setShowDesktopTranscript] = useState(false);

  useEffect(() => {
    spanRefsRef.current.clear();
  }, [breakdown]);

  const [columnRefs, setColumnRefs] = useState<Partial<Record<CategoryKey, HTMLElement | null>>>(
    {},
  );

  const setCommitmentsRef = useCallback((el: HTMLElement | null) => {
    setColumnRefs((prev) => (prev.commitments === el ? prev : { ...prev, commitments: el }));
  }, []);
  const setDecisionsRef = useCallback((el: HTMLElement | null) => {
    setColumnRefs((prev) => (prev.decisions === el ? prev : { ...prev, decisions: el }));
  }, []);
  const setIdeasRef = useCallback((el: HTMLElement | null) => {
    setColumnRefs((prev) => (prev.ideas === el ? prev : { ...prev, ideas: el }));
  }, []);
  const setPeopleRef = useCallback((el: HTMLElement | null) => {
    setColumnRefs((prev) => (prev.people === el ? prev : { ...prev, people: el }));
  }, []);
  const setQuestionsRef = useCallback((el: HTMLElement | null) => {
    setColumnRefs((prev) => (prev.questions === el ? prev : { ...prev, questions: el }));
  }, []);

  const isOfflineError = error === OFFLINE_ERROR || error === 'offline';

  if (generating && !breakdown) {
    return <FlowchartSkeleton />;
  }

  if (!breakdown) {
    return <CalmEmptyCard isOffline={isOfflineError && !!error} />;
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="px-0.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="size-3 text-primary" />
          Day map
          {generatedAt ? (
            <span>· Updated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}</span>
          ) : null}
          {generating ? (
            <span className="inline-flex items-center gap-1">
              · <RefreshCw className="size-3 animate-spin" /> refreshing
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          {breakdown.title}
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
          {breakdown.summary}
        </p>
      </header>

      {/* Mobile / tablet: Murmur-style vertical timeline */}
      <div className="md:hidden">
        <DayTimeline
          breakdown={breakdown}
          events={events}
          eventsConnected={connected}
          eventsLoading={eventsLoading}
        />
      </div>

      {/* Desktop: transcript + grid */}
      <div className="hidden md:flex md:flex-col md:gap-4">
        <div ref={containerRef} className="relative flex flex-col gap-4 md:flex-row md:gap-6">
          {showDesktopTranscript ? (
            <ConnectorLines
              containerRef={containerRef}
              spanRefsRef={spanRefsRef}
              columnRefs={columnRefs}
              spans={breakdown.spans}
            />
          ) : null}

          <div className="md:w-[42%] md:shrink-0">
            <button
              type="button"
              onClick={() => setShowDesktopTranscript((v) => !v)}
              className="mb-2 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              {showDesktopTranscript ? 'Hide ramble' : 'Show ramble'}
            </button>
            {showDesktopTranscript ? (
              <TranscriptPanel
                text={breakdown.mergedTranscript}
                spans={breakdown.spans}
                spanRefsRef={spanRefsRef}
              />
            ) : (
              <p className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                Transcript hidden — open it to see highlights linked to categories.
              </p>
            )}
          </div>

          <div className="md:min-w-0 md:flex-1">
            <CategoryGrid
              breakdown={breakdown}
              hideEmpty
              columnRefs={{
                commitments: setCommitmentsRef,
                decisions: setDecisionsRef,
                ideas: setIdeasRef,
                people: setPeopleRef,
                questions: setQuestionsRef,
              }}
            />
          </div>
        </div>
      </div>

      {error && !isOfflineError && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Couldn&apos;t refresh your day map</span>
          <Button variant="ghost" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
      {error && isOfflineError && (
        <p className="text-center text-sm text-muted-foreground/70">
          Working offline for now
        </p>
      )}
    </section>
  );
}

function CalmEmptyCard({ isOffline = false }: { isOffline?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="calm-empty-card">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Mic className="size-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Hold the mic to start your day
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your voice note turns into today&apos;s map — Commitments, Decisions,
          Ideas, People, Questions.
        </p>
      </div>
      {isOffline && (
        <p className="mt-3 text-xs text-muted-foreground/60">
          Working offline for now
        </p>
      )}
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
      <div className="flex flex-col gap-4 pl-12">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="size-4 animate-pulse text-primary" />
        <p className="text-sm text-muted-foreground">Building your day map…</p>
      </div>
    </div>
  );
}
