'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{label}</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Today · {today}</p>
      </div>
      <Link
        href="/search"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-10 shrink-0')}
        aria-label="Search journal"
      >
        <Search className="size-5" />
      </Link>
    </header>
  );
}
