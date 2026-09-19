'use client';

import type { DailyFlowchart } from '@/lib/schemas';
import { getActiveHabitNames } from '@/lib/local-habits';
import { getLocalJournal, notifyJournalChanged, saveLocalJournal } from '@/lib/local-journal';
import { consumeAIQuota, hasAIAccess } from '@/lib/billing/entitlements';

export type RegenerateJournalResponse = {
  date: string;
  breakdown: DailyFlowchart;
  generatedAt: string;
};

export class AIQuotaExhaustedError extends Error {
  constructor() {
    super('Weekly AI quota exhausted. Upgrade to Plus for unlimited AI features.');
    this.name = 'AIQuotaExhaustedError';
  }
}

export async function regenerateJournal(
  date: string,
  transcripts: { recordedAt: string; transcript: string }[],
): Promise<RegenerateJournalResponse> {
  if (!hasAIAccess()) {
    throw new AIQuotaExhaustedError();
  }

  const response = await fetch(`/api/journal/${date}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcripts,
      habitNames: getActiveHabitNames(),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to generate flowchart');
  }

  consumeAIQuota();

  const result = payload as RegenerateJournalResponse;
  saveLocalJournal(date, {
    breakdown: result.breakdown,
    generatedAt: result.generatedAt,
    error: null,
  });
  notifyJournalChanged();
  return result;
}

export function markJournalError(date: string, error: string) {
  saveLocalJournal(date, { error, breakdown: null, generatedAt: null });
  notifyJournalChanged();
}

export function getCachedJournal(date: string) {
  return getLocalJournal(date);
}
