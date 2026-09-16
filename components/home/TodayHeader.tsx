'use client';

import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';

export function TodayHeader() {
  const timezone = detectBrowserTimezone();
  const today = getTodayDateString(timezone);
  const label = formatInTimeZone(new Date(), timezone, 'EEEE, MMM d');

  return (
    <header className="flex items-start justify-between gap-3 px-0.5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{label}</h1>
          <Sparkles className="size-5 text-primary" aria-hidden />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your daily journal · {today}
        </p>
      </div>
      <Link
        href="/search"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-11 shrink-0 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary'
        )}
        aria-label="Search journal"
      >
        <Search className="size-5" />
      </Link>
    </header>
  );
}
