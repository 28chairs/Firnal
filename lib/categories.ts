/** Flowchart category colors — Structured palette */
export const CATEGORIES = {
  commitments: { label: 'Commitments', color: '#C43A37', className: 'bg-commitments' },
  decisions: { label: 'Decisions', color: '#69A859', className: 'bg-decisions' },
  ideas: { label: 'Ideas', color: '#6581A2', className: 'bg-ideas' },
  people: { label: 'People', color: '#2C5073', className: 'bg-people' },
  questions: { label: 'Questions', color: '#F49F99', className: 'bg-questions' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
