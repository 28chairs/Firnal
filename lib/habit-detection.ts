import { z } from 'zod';
import { getOpenAIClient } from '@/lib/openai';

const habitDetectionSchema = z.object({
  completedHabitIds: z.array(z.string()),
  confidence: z.enum(['high', 'medium']),
});

export type HabitDetectionInput = {
  id: string;
  name: string;
};

export type HabitDetectionResult = z.infer<typeof habitDetectionSchema>;

export async function detectHabitCompletions(
  transcript: string,
  habits: HabitDetectionInput[],
): Promise<HabitDetectionResult> {
  if (habits.length === 0) {
    return { completedHabitIds: [], confidence: 'high' };
  }

  const openai = getOpenAIClient();
  const habitList = habits.map((habit) => `- ${habit.id}: ${habit.name}`).join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You detect habit completions from voice journal transcripts.

Return JSON: { "completedHabitIds": string[], "confidence": "high" | "medium" }

Rules:
- Only mark a habit complete on explicit or strongly implied completion ("I went for a run" → Exercise).
- Do NOT mark on intent alone ("I should meditate" is NOT complete).
- completedHabitIds must use habit ids from the provided list only.
- Return an empty array if none were completed.`,
      },
      {
        role: 'user',
        content: `Habits:\n${habitList}\n\nTranscript:\n${transcript}`,
      },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return { completedHabitIds: [], confidence: 'high' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { completedHabitIds: [], confidence: 'high' };
  }

  const result = habitDetectionSchema.safeParse(parsed);
  if (!result.success) {
    return { completedHabitIds: [], confidence: 'high' };
  }

  const validIds = new Set(habits.map((habit) => habit.id));
  return {
    completedHabitIds: result.data.completedHabitIds.filter((id) => validIds.has(id)),
    confidence: result.data.confidence,
  };
}
