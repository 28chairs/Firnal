import { z } from 'zod';

export const categoryKeySchema = z.enum([
  'commitments',
  'decisions',
  'ideas',
  'people',
  'questions',
]);

export const transcriptSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  category: categoryKeySchema,
  label: z.string().optional(),
});

export const personSchema = z.object({
  name: z.string().min(1),
  initial: z.string().min(1).max(2),
});

export const dailyFlowchartSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  mergedTranscript: z.string().min(1),
  spans: z.array(transcriptSpanSchema),
  commitments: z.array(z.string()),
  decisions: z.array(z.string()),
  ideas: z.array(z.string()),
  people: z.array(personSchema),
  questions: z.array(z.string()),
  mood: z.string().optional(),
});

export type CategoryKey = z.infer<typeof categoryKeySchema>;
export type TranscriptSpan = z.infer<typeof transcriptSpanSchema>;
export type DailyFlowchart = z.infer<typeof dailyFlowchartSchema>;

export function clampSpansToTranscript(
  breakdown: DailyFlowchart,
): DailyFlowchart {
  const length = breakdown.mergedTranscript.length;

  const spans = breakdown.spans
    .map((span) => {
      const start = Math.max(0, Math.min(span.start, length));
      const end = Math.max(start, Math.min(span.end, length));
      return end > start ? { ...span, start, end } : null;
    })
    .filter((span): span is TranscriptSpan => span !== null);

  return { ...breakdown, spans };
}
