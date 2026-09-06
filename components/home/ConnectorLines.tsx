'use client';

import { useEffect, useState } from 'react';
import { CATEGORIES, type CategoryKey } from '@/lib/categories';
import type { TranscriptSpan } from '@/lib/schemas';
import type { SpanRefMap } from '@/components/home/TranscriptPanel';

type ConnectorLinesProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  spanRefsRef: React.RefObject<SpanRefMap>;
  columnRefs: Partial<Record<CategoryKey, HTMLElement | null>>;
  spans: TranscriptSpan[];
};

type LineSegment = {
  id: string;
  d: string;
  color: string;
};

export function ConnectorLines({
  containerRef,
  spanRefsRef,
  columnRefs,
  spans,
}: ConnectorLinesProps) {
  const [lines, setLines] = useState<LineSegment[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || spans.length === 0) {
      setLines([]);
      return;
    }

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const next: LineSegment[] = [];

      spans.forEach((span, index) => {
        const mark = spanRefsRef.current?.get(index);
        const column = columnRefs[span.category];
        if (!mark || !column) return;

        const markRect = mark.getBoundingClientRect();
        const colRect = column.getBoundingClientRect();

        const x1 = markRect.right - containerRect.left;
        const y1 = markRect.top + markRect.height / 2 - containerRect.top;
        const x2 = colRect.left - containerRect.left;
        const y2 = colRect.top + 16 - containerRect.top;

        const cx = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;

        next.push({
          id: `${index}-${span.category}`,
          d,
          color: CATEGORIES[span.category].color,
        });
      });

      setLines(next);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef, spanRefsRef, columnRefs, spans]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 hidden md:block"
      aria-hidden
    >
      {lines.map((line) => (
        <path
          key={line.id}
          d={line.d}
          fill="none"
          stroke={line.color}
          strokeWidth={1.5}
          strokeOpacity={0.45}
        />
      ))}
    </svg>
  );
}
