'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { detectBrowserTimezone } from '@/lib/timezone';

export function TodayHeader() {
  const timezone = detectBrowserTimezone();
  const label = formatInTimeZone(new Date(), timezone, 'EEEE, MMMM d');

  return (
    <header className="flex items-center justify-between gap-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{label}</h1>
      <Link
        href="/search"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-10 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        aria-label="Search"
      >
        <Search className="size-5" />
      </Link>
    </header>
  );
}
