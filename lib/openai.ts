import OpenAI from 'openai';
import { getServerEnv } from '@/lib/env';

let client: OpenAI | null = null;

const PLACEHOLDER_KEY_PATTERNS = [
  /^sk-your-/i,
  /^sk-[a-z]+-key$/i,
  /^your-/i,
  /placeholder/i,
];

function isPlaceholderKey(key: string): boolean {
  return PLACEHOLDER_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const { OPENAI_API_KEY } = getServerEnv();
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to your environment.');
    }
    if (isPlaceholderKey(OPENAI_API_KEY)) {
      throw new Error('OpenAI API key is a placeholder. Replace it with a real key in your environment.');
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
