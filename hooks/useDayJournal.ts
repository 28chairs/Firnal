'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getLocalCapturesForDate } from '@/lib/local-captures';
import {
  getCachedJournal,
  markJournalError,
  regenerateJournal,
} from '@/lib/api/regenerateJournal';
import {
  getLocalJournalSnapshot,
  getServerJournalSnapshot,
  JOURNAL_CHANGED_EVENT,
} from '@/lib/local-journal';
import { CAPTURES_CHANGED_EVENT } from '@/lib/recording';

const DEBOUNCE_MS = 30_000;

const snapshotByDate = new Map<string, () => ReturnType<typeof getLocalJournalSnapshot>>();

function getSnapshotForDate(date: string) {
  let getSnapshot = snapshotByDate.get(date);
  if (!getSnapshot) {
    getSnapshot = () => getLocalJournalSnapshot(date);
    snapshotByDate.set(date, getSnapshot);
  }
  return getSnapshot;
}

function subscribeJournal(onStoreChange: () => void) {
  window.addEventListener(JOURNAL_CHANGED_EVENT, onStoreChange);
  window.addEventListener(CAPTURES_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener(JOURNAL_CHANGED_EVENT, onStoreChange);
    window.removeEventListener(CAPTURES_CHANGED_EVENT, onStoreChange);
  };
}

export function useDayJournal(date: string) {
  const [generating, setGenerating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generatingRef = useRef(false);

  const journal = useSyncExternalStore(
    subscribeJournal,
    getSnapshotForDate(date),
    getServerJournalSnapshot,
  );

  const runRegenerate = useCallback(async () => {
    const entries = getLocalCapturesForDate(date).filter(
      (entry) => entry.status === 'transcribed' && entry.transcript?.trim(),
    );

    if (entries.length === 0 || generatingRef.current) {
      return;
    }

    generatingRef.current = true;
    setGenerating(true);

    try {
      await regenerateJournal(
        date,
        entries.map((entry) => ({
          recordedAt: entry.recordedAt,
          transcript: entry.transcript!,
        })),
      );
    } catch (err) {
      markJournalError(
        date,
        err instanceof Error ? err.message : 'Failed to generate flowchart',
      );
    } finally {
      generatingRef.current = false;
      setGenerating(false);
    }
  }, [date]);

  const scheduleRegenerate = useCallback(
    (immediate = false) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      const entries = getLocalCapturesForDate(date).filter(
        (entry) => entry.status === 'transcribed' && entry.transcript?.trim(),
      );

      if (entries.length === 0) return;

      const cached = getCachedJournal(date);
      if (immediate || !cached.breakdown) {
        void runRegenerate();
        return;
      }

      debounceRef.current = setTimeout(() => {
        void runRegenerate();
      }, DEBOUNCE_MS);
    },
    [date, runRegenerate],
  );

  useEffect(() => {
    const entries = getLocalCapturesForDate(date).filter(
      (entry) => entry.status === 'transcribed' && entry.transcript?.trim(),
    );
    if (entries.length > 0 && !getCachedJournal(date).breakdown) {
      scheduleRegenerate(true);
    }

    const onCaptureChange = () => scheduleRegenerate();

    window.addEventListener(CAPTURES_CHANGED_EVENT, onCaptureChange);

    return () => {
      window.removeEventListener(CAPTURES_CHANGED_EVENT, onCaptureChange);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [date, scheduleRegenerate]);

  return {
    breakdown: journal.breakdown,
    generatedAt: journal.generatedAt,
    error: journal.error,
    generating,
    retry: () => scheduleRegenerate(true),
  };
}
