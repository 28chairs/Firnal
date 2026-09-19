'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { detectBrowserTimezone } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  colorId?: string;
  htmlLink?: string;
};

type EventsResponse = {
  events: CalendarEvent[];
  connected: boolean;
  error?: string;
};

const EVENT_COLORS: Record<string, string> = {
  '1': 'bg-[#a4bdfc]/20 border-[#a4bdfc]/40',
  '2': 'bg-[#7ae7bf]/20 border-[#7ae7bf]/40',
  '3': 'bg-[#dbadff]/20 border-[#dbadff]/40',
  '4': 'bg-[#ff887c]/20 border-[#ff887c]/40',
  '5': 'bg-[#fbd75b]/20 border-[#fbd75b]/40',
  '6': 'bg-[#ffb878]/20 border-[#ffb878]/40',
  '7': 'bg-[#46d6db]/20 border-[#46d6db]/40',
  '8': 'bg-[#e1e1e1]/20 border-[#e1e1e1]/40',
  '9': 'bg-[#5484ed]/20 border-[#5484ed]/40',
  '10': 'bg-[#51b749]/20 border-[#51b749]/40',
  '11': 'bg-[#dc2127]/20 border-[#dc2127]/40',
  default: 'bg-primary/10 border-primary/30',
};

function formatEventTime(start: string, end: string, allDay: boolean): string {
  if (allDay) return 'All day';

  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    return `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`;
  } catch {
    return '';
  }
}

function formatStartTime(start: string, allDay: boolean): string {
  if (allDay) return 'All day';

  try {
    return format(parseISO(start), 'h:mm a');
  } catch {
    return '';
  }
}

export function CalendarEventsStrip() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const timezone = detectBrowserTimezone();
        const response = await fetch(`/api/calendar/events?timezone=${encodeURIComponent(timezone)}`);
        const data = (await response.json()) as EventsResponse;

        setEvents(data.events || []);
        setConnected(data.connected);
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    const interval = setInterval(fetchEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-0.5">
          <Calendar className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s schedule</h2>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-40 shrink-0 animate-pulse rounded-xl bg-muted/50"
            />
          ))}
        </div>
      </section>
    );
  }

  if (connected === false) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-0.5">
          <Calendar className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s schedule</h2>
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-card/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Calendar className="size-5" />
          <span>Connect Google Calendar to see today&apos;s events</span>
        </Link>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-0.5">
          <Calendar className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s schedule</h2>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/50 px-4 py-3 text-sm text-muted-foreground">
          No events scheduled for today
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s schedule</h2>
        </div>
        <span className="text-xs text-muted-foreground/80">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1.5">
        {events.map((event) => {
          const colorClass = EVENT_COLORS[event.colorId || ''] || EVENT_COLORS.default;

          return (
            <div
              key={event.id}
              className={cn(
                'group relative flex shrink-0 flex-col gap-1 rounded-xl border-2 px-3 py-2.5 transition-all duration-200',
                colorClass,
                event.htmlLink && 'cursor-pointer hover:shadow-sm'
              )}
              onClick={() => {
                if (event.htmlLink) {
                  window.open(event.htmlLink, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-1 text-sm font-medium text-foreground">
                  {event.summary}
                </span>
                {event.htmlLink && (
                  <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{formatStartTime(event.start, event.allDay)}</span>
              </div>
              {!event.allDay && (
                <span className="text-[10px] text-muted-foreground/70">
                  {formatEventTime(event.start, event.end, event.allDay)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
