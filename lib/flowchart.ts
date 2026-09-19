import {
  clampSpansToTranscript,
  dailyFlowchartSchema,
  type DailyFlowchart,
} from '@/lib/schemas';
import {
  buildFlowchartSystemPrompt,
  buildFlowchartUserPrompt,
  type FlowchartTranscriptInput,
} from '@/lib/prompts';
import { getOpenAIClient } from '@/lib/openai';

function sanitizeApiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes('401') || message.includes('Incorrect API key')) {
      return 'OpenAI API key is invalid or not configured. Check your OPENAI_API_KEY.';
    }
    if (message.includes('429') || message.includes('rate limit')) {
      return 'Rate limit reached. Please try again in a moment.';
    }
    if (message.includes('500') || message.includes('503')) {
      return 'OpenAI service is temporarily unavailable. Try again later.';
    }
    return message;
  }
  return 'An unexpected error occurred';
}

export async function generateDailyFlowchart(
  transcripts: FlowchartTranscriptInput[],
  habitNames: string[] = [],
  validationError?: string,
): Promise<DailyFlowchart> {
  if (transcripts.length === 0) {
    throw new Error('No transcripts to analyze');
  }

  let openai;
  try {
    openai = getOpenAIClient();
  } catch (error) {
    throw new Error(sanitizeApiError(error));
  }

  const system = buildFlowchartSystemPrompt(habitNames);
  let user = buildFlowchartUserPrompt(transcripts);

  if (validationError) {
    user += `\n\nPrevious response failed validation: ${validationError}\nFix the JSON and try again.`;
  }

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
    });
  } catch (error) {
    throw new Error(sanitizeApiError(error));
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from AI');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const result = dailyFlowchartSchema.safeParse(parsed);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    if (!validationError) {
      return generateDailyFlowchart(transcripts, habitNames, message);
    }
    throw new Error(`Validation failed: ${message}`);
  }

  return clampSpansToTranscript(result.data);
}
