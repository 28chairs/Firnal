/** Flowchart category colors — used in Phase 3+ */
export const CATEGORIES = {
  commitments: { label: 'Commitments', color: '#F97316', className: 'bg-commitments' },
  decisions: { label: 'Decisions', color: '#22C55E', className: 'bg-decisions' },
  ideas: { label: 'Ideas', color: '#3B82F6', className: 'bg-ideas' },
  people: { label: 'People', color: '#64748B', className: 'bg-people' },
  questions: { label: 'Questions', color: '#EC4899', className: 'bg-questions' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
