/** Flowchart category colors — Soft-Nuances muted warmth palette */
export const CATEGORIES = {
  commitments: { label: 'Commitments', color: '#E8A07A', className: 'bg-commitments' },
  decisions: { label: 'Decisions', color: '#9BB87A', className: 'bg-decisions' },
  ideas: { label: 'Ideas', color: '#7A93B0', className: 'bg-ideas' },
  people: { label: 'People', color: '#7D736C', className: 'bg-people' },
  questions: { label: 'Questions', color: '#D9A0A8', className: 'bg-questions' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
