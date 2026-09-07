'use client';

import { useSyncExternalStore } from 'react';
import { getJournaledDatesInMonth } from '@/lib/calendar-month';
import { JOURNAL_CHANGED_EVENT } from '@/lib/local-journal';
import { CAPTURES_CHANGED_EVENT } from '@/lib/recording';
import { detectBrowserTimezone } from '@/lib/timezone';

function subscribe(onStoreChange: () => void) {
  window.addEventListener(JOURNAL_CHANGED_EVENT, onStoreChange);
  window.addEventListener(CAPTURES_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener(JOURNAL_CHANGED_EVENT, onStoreChange);
    window.removeEventListener(CAPTURES_CHANGED_EVENT, onStoreChange);
  };
}

const emptySet = new Set<string>();
const snapshotCache = new Map<string, Set<string>>();

function getSnapshotKey(year: number, month: number) {
  return `${year}-${month}`;
}

function setsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

export function useCalendarMonth(year: number, month: number) {
  const timezone = detectBrowserTimezone();

  return useSyncExternalStore(
    subscribe,
    () => {
      const key = getSnapshotKey(year, month);
      const next = getJournaledDatesInMonth(year, month, timezone);
      const cached = snapshotCache.get(key);
      if (cached && setsEqual(cached, next)) return cached;
      snapshotCache.set(key, next);
      return next;
    },
    () => emptySet,
  );
}
