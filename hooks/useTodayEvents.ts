'use client';

import { useEffect, useState } from 'react';
import { detectBrowserTimezone } from '@/lib/timezone';

export type CalendarEvent = {
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

export function useTodayEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const timezone = detectBrowserTimezone();
        const response = await fetch(
          `/api/calendar/events?timezone=${encodeURIComponent(timezone)}`,
        );
        const data = (await response.json()) as EventsResponse;
        if (cancelled) return;
        setEvents(data.events || []);
        setConnected(data.connected);
      } catch {
        if (!cancelled) setConnected(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchEvents();
    const interval = setInterval(fetchEvents, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { events, connected, loading };
}
