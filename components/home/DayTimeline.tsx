'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  HelpCircle,
  Lightbulb,
  Scale,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { CategoryCard, PersonCard } from '@/components/home/CategoryCard';
import { CATEGORIES, type CategoryKey } from '@/lib/categories';
import type { DailyFlowchart } from '@/lib/schemas';
import type { CalendarEvent } from '@/hooks/useTodayEvents';
import { cn } from '@/lib/utils';

const CATEGORY_ORDER: CategoryKey[] = [
  'commitments',
  'decisions',
  'ideas',
  'people',
  'questions',
];

const CATEGORY_ICONS: Record<CategoryKey, LucideIcon> = {
  commitments: CheckSquare,
  decisions: Scale,
  ideas: Lightbulb,
  people: Users,
  questions: HelpCircle,
};

function formatStartTime(start: string, allDay: boolean): string {
  if (allDay) return 'All day';
  try {
    return format(parseISO(start), 'HH:mm');
  } catch {
    return '';
  }
}

function sectionCount(category: CategoryKey, breakdown: DailyFlowchart): number {
  if (category === 'people') return breakdown.people.length;
  return breakdown[category].length;
}

type DayTimelineProps = {
  breakdown: DailyFlowchart;
  events: CalendarEvent[];
  eventsConnected: boolean | null;
  eventsLoading?: boolean;
};

export function DayTimeline({
  breakdown,
  events,
  eventsConnected,
  eventsLoading = false,
}: DayTimelineProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const visibleCategories = CATEGORY_ORDER.filter(
    (key) => sectionCount(key, breakdown) > 0,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="relative pl-1">
        {/* Vertical rail */}
        <div
          className="absolute bottom-2 left-[19px] top-2 w-px bg-border/80"
          aria-hidden
        />

        <div className="flex flex-col gap-6">
          {/* Schedule */}
          <TimelineBlock
            icon={Calendar}
            label="Schedule"
            count={eventsLoading ? undefined : events.length}
            accent="#6581A2"
          >
            {eventsLoading ? (
              <p className="text-sm text-muted-foreground">Loading events…</p>
            ) : events.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-2xl border border-border/60 bg-card px-3.5 py-2.5 text-sm shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatStartTime(event.start, event.allDay)}
                    </span>
                    <p className="mt-0.5 font-medium leading-snug text-foreground">
                      {event.summary || 'Busy'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : eventsConnected ? (
              <p className="rounded-2xl border border-dashed border-border/70 px-3.5 py-3 text-sm text-muted-foreground">
                No events on the calendar today.
              </p>
            ) : (
              <Link
                href="/profile"
                className="block rounded-2xl border border-dashed border-border/70 px-3.5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
              >
                Connect Google Calendar in Profile to see today’s schedule.
              </Link>
            )}
          </TimelineBlock>

          {/* Firnal categories */}
          {visibleCategories.map((category) => {
            const meta = CATEGORIES[category];
            const Icon = CATEGORY_ICONS[category];
            const count = sectionCount(category, breakdown);

            return (
              <TimelineBlock
                key={category}
                icon={Icon}
                label={meta.label}
                count={count}
                accent={meta.color}
              >
                <div className="flex flex-col gap-2">
                  {category === 'people'
                    ? breakdown.people.map((person) => (
                        <PersonCard
                          key={person.name}
                          name={person.name}
                          initial={person.initial}
                          color={meta.color}
                        />
                      ))
                    : (breakdown[category] as string[]).map((item) => (
                        <CategoryCard key={item} color={meta.color}>
                          {item}
                        </CategoryCard>
                      ))}
                </div>
              </TimelineBlock>
            );
          })}

          {visibleCategories.length === 0 && (
            <p className="pl-12 text-sm text-muted-foreground">
              Categories will show up here after your next voice note.
            </p>
          )}
        </div>
      </div>

      {/* Collapsed transcript */}
      <div className="rounded-2xl border border-border/60 bg-card/80">
        <button
          type="button"
          aria-expanded={showTranscript}
          onClick={() => setShowTranscript((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-foreground">Your ramble</span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform duration-200',
              showTranscript && 'rotate-180',
            )}
          />
        </button>
        {showTranscript ? (
          <div className="border-t border-border/60 px-4 py-3">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {breakdown.mergedTranscript}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TimelineBlock({
  icon: Icon,
  label,
  count,
  accent,
  children,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-12">
      <div
        className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border border-border/70 bg-background shadow-sm"
        style={{ color: accent }}
      >
        <Icon className="size-4" aria-hidden />
      </div>

      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {label}
          {typeof count === 'number' ? (
            <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
              {count}
            </span>
          ) : null}
        </span>
      </div>

      {children}
    </section>
  );
}
