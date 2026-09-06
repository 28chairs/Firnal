import OpenAI from 'openai';
import { getServerEnv } from '@/lib/env';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const { OPENAI_API_KEY } = getServerEnv();
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return client;
}

export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const openai = getOpenAIClient();
  const file = new File([new Uint8Array(buffer)], filename, { type: mimeType });

  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });

  const text = result.text?.trim();
  if (!text) {
    throw new Error('No speech detected');
  }

  return text;
}
