import type { CategoryKey } from '@/lib/schemas';

export type FlowchartTranscriptInput = {
  recordedAt: string;
  transcript: string;
};

export function buildFlowchartSystemPrompt(habitNames: string[] = []) {
  const habitsLine =
    habitNames.length > 0
      ? `The user tracks these habits: ${habitNames.join(', ')}. Mention them only if explicitly referenced in the transcripts.`
      : 'The user has no habits configured yet.';

  return `You are a journaling assistant that turns voice ramble transcripts into a structured daily flowchart.

${habitsLine}

Return a single JSON object with this exact shape:
{
  "title": "short evocative title for the day",
  "summary": "1-2 sentence overview",
  "mergedTranscript": "cleaned narrative merging all captures chronologically",
  "spans": [{ "start": 0, "end": 12, "category": "ideas", "label": "optional short label" }],
  "commitments": ["string items"],
  "decisions": ["string items"],
  "ideas": ["string items"],
  "people": [{ "name": "Full Name", "initial": "F" }],
  "questions": ["string items"],
  "mood": "optional one-word or short phrase"
}

Rules:
- Merge all captures into one coherent mergedTranscript. Remove filler words lightly; do not rewrite facts.
- Extract items into exactly these 5 categories: commitments, decisions, ideas, people, questions.
- spans: character offsets (0-based) into mergedTranscript for phrases that belong to a category. Use category keys exactly as listed.
- Do NOT invent facts, names, or events not present in the transcripts.
- Deduplicate similar items across captures.
- people: extract names mentioned; initial is the first letter of their first name (uppercase).
- Category arrays should contain concise bullet-style strings (not duplicates of span text unless helpful).
- If a category has nothing, return an empty array.
- mood is optional; omit if unclear.`;
}

export function buildFlowchartUserPrompt(transcripts: FlowchartTranscriptInput[]) {
  const blocks = transcripts
    .map((entry, index) => {
      const time = new Date(entry.recordedAt).toISOString();
      return `Capture ${index + 1} (${time}):\n${entry.transcript.trim()}`;
    })
    .join('\n\n');

  return `Merge these voice captures from the same calendar day into one daily flowchart JSON:\n\n${blocks}`;
}

export const CATEGORY_ORDER: CategoryKey[] = [
  'commitments',
  'decisions',
  'ideas',
  'people',
  'questions',
];
