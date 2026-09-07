import { getAllLocalCaptures } from '@/lib/local-captures';
import { getLocalJournal, listLocalJournalDates } from '@/lib/local-journal';
import type { DailyFlowchart } from '@/lib/schemas';
import type { SearchResult } from '@/lib/types/search';
import { detectBrowserTimezone } from '@/lib/timezone';
import { formatInTimeZone } from 'date-fns-tz';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSnippet(text: string, query: string, radius = 60): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) return text.slice(0, radius * 2);

  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + query.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function highlightSnippet(snippet: string, query: string): string {
  if (!query.trim()) return snippet;
  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return snippet.replace(pattern, '<<mark>>$1<</mark>>');
}

function journalSearchTexts(breakdown: DailyFlowchart): string[] {
  return [
    breakdown.title,
    breakdown.summary,
    breakdown.mergedTranscript,
    ...breakdown.commitments,
    ...breakdown.decisions,
    ...breakdown.ideas,
    ...breakdown.people.map((person) => person.name),
    ...breakdown.questions,
  ];
}

export function searchLocalJournals(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const lowerQuery = trimmed.toLowerCase();
  const results: SearchResult[] = [];
  const seenDates = new Set<string>();
  const timezone = detectBrowserTimezone();

  for (const entry of getAllLocalCaptures()) {
    if (entry.status !== 'transcribed' || !entry.transcript) continue;
    const transcript = entry.transcript;
    if (!transcript.toLowerCase().includes(lowerQuery)) continue;

    const date = formatInTimeZone(new Date(entry.recordedAt), timezone, 'yyyy-MM-dd');
    if (seenDates.has(`voice:${date}:${entry.id}`)) continue;
    seenDates.add(`voice:${date}:${entry.id}`);

    const journal = getLocalJournal(date);
    results.push({
      date,
      title: journal.breakdown?.title ?? `Recording · ${date}`,
      snippet: highlightSnippet(buildSnippet(transcript, trimmed), trimmed),
      matchSource: 'voice',
    });
  }

  for (const date of listLocalJournalDates()) {
    const journal = getLocalJournal(date);
    if (!journal.breakdown) continue;

    const matchText = journalSearchTexts(journal.breakdown).find((text) =>
      text.toLowerCase().includes(lowerQuery),
    );
    if (!matchText) continue;

    const key = `journal:${date}`;
    if (seenDates.has(key)) continue;
    seenDates.add(key);

    results.push({
      date,
      title: journal.breakdown.title,
      snippet: highlightSnippet(buildSnippet(matchText, trimmed), trimmed),
      matchSource: 'journal',
    });
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
}
