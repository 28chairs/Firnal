import OpenAI from 'openai';
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

export const OFFLINE_ERROR = 'offline';

export async function generateDailyFlowchart(
  transcripts: FlowchartTranscriptInput[],
  habitNames: string[] = [],
  validationError?: string,
): Promise<DailyFlowchart> {
  if (transcripts.length === 0) {
    throw new Error('No transcripts to analyze');
  }

  let openai: OpenAI;
  try {
    openai = getOpenAIClient();
  } catch (err) {
    if (err instanceof Error && err.message === OFFLINE_ERROR) {
      throw err;
    }
    throw new Error(OFFLINE_ERROR);
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
  } catch (err) {
    if (
      err instanceof OpenAI.APIError &&
      (err.status === 401 || err.status === 403)
    ) {
      throw new Error(OFFLINE_ERROR);
    }
    throw err;
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
