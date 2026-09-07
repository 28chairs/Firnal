import type { DailyFlowchart } from '@/lib/schemas';

const STORAGE_KEY = 'firnal:daily-journals';

export type StoredDailyJournal = {
  date: string;
  breakdown: DailyFlowchart | null;
  generatedAt: string | null;
  error: string | null;
};

type JournalStore = Record<string, Omit<StoredDailyJournal, 'date'>>;

const SERVER_JOURNAL_SNAPSHOT: StoredDailyJournal = {
  date: '',
  breakdown: null,
  generatedAt: null,
  error: null,
};

const emptyJournalByDate = new Map<string, StoredDailyJournal>();
const clientSnapshotByDate = new Map<string, StoredDailyJournal>();

function readStore(): JournalStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as JournalStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: JournalStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function journalSignature(journal: StoredDailyJournal) {
  return `${journal.generatedAt ?? ''}|${journal.error ?? ''}|${
    journal.breakdown ? JSON.stringify(journal.breakdown) : ''
  }`;
}

function getEmptyJournal(date: string): StoredDailyJournal {
  let empty = emptyJournalByDate.get(date);
  if (!empty) {
    empty = { date, breakdown: null, generatedAt: null, error: null };
    emptyJournalByDate.set(date, empty);
  }
  return empty;
}

function readJournalFromStorage(date: string): StoredDailyJournal {
  const row = readStore()[date];
  if (!row) {
    return getEmptyJournal(date);
  }

  return {
    date,
    breakdown: row.breakdown ?? null,
    generatedAt: row.generatedAt ?? null,
    error: row.error ?? null,
  };
}

/** Stable snapshot for useSyncExternalStore — same reference until data changes. */
export function getLocalJournalSnapshot(date: string): StoredDailyJournal {
  const next = readJournalFromStorage(date);
  const cached = clientSnapshotByDate.get(date);

  if (cached && journalSignature(cached) === journalSignature(next)) {
    return cached;
  }

  clientSnapshotByDate.set(date, next);
  return next;
}

export function getServerJournalSnapshot(): StoredDailyJournal {
  return SERVER_JOURNAL_SNAPSHOT;
}

export function getLocalJournal(date: string): StoredDailyJournal {
  return getLocalJournalSnapshot(date);
}

export function saveLocalJournal(
  date: string,
  patch: Partial<Omit<StoredDailyJournal, 'date'>>,
) {
  const store = readStore();
  const existing = store[date] ?? {
    breakdown: null,
    generatedAt: null,
    error: null,
  };
  store[date] = { ...existing, ...patch };
  writeStore(store);

  const updated: StoredDailyJournal = {
    date,
    breakdown: store[date].breakdown ?? null,
    generatedAt: store[date].generatedAt ?? null,
    error: store[date].error ?? null,
  };
  clientSnapshotByDate.set(date, updated);
}

export const JOURNAL_CHANGED_EVENT = 'firnal:journal-changed';

export function notifyJournalChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(JOURNAL_CHANGED_EVENT));
  }
}

/** Dates with a saved flowchart breakdown. */
export function listLocalJournalDates(): string[] {
  const store = readStore();
  return Object.keys(store).filter((date) => store[date]?.breakdown != null);
}
