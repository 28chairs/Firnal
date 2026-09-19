import OpenAI from 'openai';
import { getServerEnv } from '@/lib/env';

let client: OpenAI | null = null;

const PLACEHOLDER_KEY_PATTERNS = [
  /^sk-your-/i,
  /^sk-test-/i,
  /^sk-proj-your-/i,
  /^sk-xxx/i,
  /^your[_-]?api[_-]?key/i,
  /^placeholder/i,
  /^insert[_-]?your/i,
  /^change[_-]?me/i,
];

export function isPlaceholderApiKey(key: string | undefined): boolean {
  if (!key || key.length < 20) return true;
  return PLACEHOLDER_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function isOpenAIConfigured(): boolean {
  const { OPENAI_API_KEY } = getServerEnv();
  return !isPlaceholderApiKey(OPENAI_API_KEY);
}

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const { OPENAI_API_KEY } = getServerEnv();
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    if (isPlaceholderApiKey(OPENAI_API_KEY)) {
      throw new Error('offline');
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
