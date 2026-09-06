'use client';

import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type HabitCompleteRingProps = {
  emoji: string;
  completed: boolean;
  accentColor: string;
  onToggle: () => void;
  name: string;
};

export function HabitCompleteRing({
  emoji,
  completed,
  accentColor,
  onToggle,
  name,
}: HabitCompleteRingProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={completed ? `Mark ${name} incomplete` : `Mark ${name} complete`}
      className={cn(
        'relative flex size-[3.25rem] shrink-0 items-center justify-center rounded-full border-[3px] transition-all duration-200 active:scale-95',
        completed ? 'text-white shadow-sm' : 'bg-card hover:bg-muted/50',
      )}
      style={{
        borderColor: accentColor,
        backgroundColor: completed ? accentColor : undefined,
      }}
    >
      {completed ? (
        <CheckIcon className="size-6" strokeWidth={2.5} aria-hidden />
      ) : (
        <span className="text-xl leading-none" aria-hidden>
          {emoji}
        </span>
      )}
    </button>
  );
}
