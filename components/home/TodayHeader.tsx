'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { detectBrowserTimezone } from '@/lib/timezone';

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TodayHeader() {
  const timezone = detectBrowserTimezone();
  const now = new Date();
  const hour = Number(formatInTimeZone(now, timezone, 'H'));
  const dateLabel = formatInTimeZone(now, timezone, 'EEEE, MMMM d');

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{greetingForHour(hour)}</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
          {dateLabel}
        </h1>
      </div>
      <Link
        href="/search"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-10 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        aria-label="Search"
      >
        <Search className="size-5" />
      </Link>
    </header>
  );
}
