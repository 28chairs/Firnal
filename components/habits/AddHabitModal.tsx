'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { GOAL_PRESETS } from '@/lib/types/habits';
import { getRecommendedPreset } from '@/lib/habit-goals';
import { cn } from '@/lib/utils';

const EMOJI_PRESETS = ['🧘', '💪', '📚', '💧', '🏃', '😴', '✍️', '🎯'];

type AddHabitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, emoji: string, goalDays: number | null) => void;
};

export function AddHabitModal({ open, onOpenChange, onCreate }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🧘');
  const [goalDays, setGoalDays] = useState<number | null>(30);

  const recommended = name.trim() ? getRecommendedPreset(name) : null;

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, emoji, goalDays);
    setName('');
    setEmoji('🧘');
    setGoalDays(30);
  };

  const selectedPreset = GOAL_PRESETS.find((preset) => preset.days === goalDays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add habit</DialogTitle>
          <DialogDescription>
            Set a goal length — research suggests 21–66 days to build lasting routines.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="habit-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="habit-name"
              placeholder="Meditate, Run, Read…"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {recommended !== null && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-primary">
                  Suggested: {recommended}-day goal for &ldquo;{name.trim()}&rdquo;
                </p>
                {goalDays !== recommended && (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary underline"
                    onClick={() => setGoalDays(recommended)}
                  >
                    Apply
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Emoji</span>
            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl border text-xl transition-colors',
                    emoji === preset
                      ? 'border-primary bg-primary/10'
                      : 'border-black/[0.06] bg-card hover:bg-muted',
                  )}
                  onClick={() => setEmoji(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Goal length</span>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setGoalDays(preset.days)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-left transition-colors',
                    goalDays === preset.days
                      ? 'border-primary bg-primary/10'
                      : 'border-black/[0.06] bg-card hover:bg-muted',
                  )}
                >
                  <span className="block text-sm font-semibold">{preset.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{preset.subtitle}</span>
                </button>
              ))}
            </div>
            {selectedPreset?.science && (
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                {selectedPreset.science}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full sm:w-auto">
            Start {selectedPreset?.label ?? 'habit'} goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
