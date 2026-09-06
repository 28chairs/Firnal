'use client';

import { CATEGORIES, type CategoryKey } from '@/lib/categories';
import type { TranscriptSpan } from '@/lib/schemas';

export type SpanRefMap = Map<number, HTMLElement | null>;

type TranscriptPanelProps = {
  text: string;
  spans: TranscriptSpan[];
  spanRefsRef?: React.RefObject<SpanRefMap>;
};

function categoryColor(category: CategoryKey) {
  return CATEGORIES[category].color;
}

export function TranscriptPanel({ text, spans, spanRefsRef }: TranscriptPanelProps) {
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((span, index) => {
    if (span.start > cursor) {
      nodes.push(<span key={`t-${cursor}`}>{text.slice(cursor, span.start)}</span>);
    }

    const color = categoryColor(span.category);
    nodes.push(
      <mark
        key={`s-${index}-${span.start}`}
        ref={(el) => {
          spanRefsRef?.current.set(index, el);
        }}
        data-category={span.category}
        data-span-index={index}
        className="rounded px-0.5 text-inherit"
        style={{ backgroundColor: `${color}28` }}
      >
        {text.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`t-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return (
    <div className="rounded-2xl border border-black/[0.04] bg-card p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your day
      </h3>
      <p className="text-[15px] leading-relaxed text-foreground">{nodes}</p>
    </div>
  );
}
