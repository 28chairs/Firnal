import { NextResponse } from 'next/server';
import { z } from 'zod';
import { detectHabitCompletions } from '@/lib/habit-detection';

const bodySchema = z.object({
  transcript: z.string().min(1),
  habits: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
    }),
  ),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const result = await detectHabitCompletions(body.transcript, body.habits);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Detection failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
