'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddHabitModal } from '@/components/habits/AddHabitModal';
import { HabitCompactTile } from '@/components/habits/HabitCompactTile';
import { HabitDetailDialog } from '@/components/habits/HabitDetailDialog';
import { HabitsTodayBanner } from '@/components/habits/HabitsTodayBanner';
import { useHabits } from '@/hooks/useHabits';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';

export function HabitList() {
  const date = getTodayDateString(detectBrowserTimezone());
  const { habits, create, toggle } = useHabits(date);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailIndex = habits.findIndex((habit) => habit.id === detailId);
  const detailHabit = detailIndex >= 0 ? habits[detailIndex] : null;

  return (
    <div className="flex flex-col gap-4">
      <HabitsTodayBanner habits={habits} />

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/[0.08] px-4 py-10 text-center">
          <p className="text-3xl" aria-hidden>
            🎯
          </p>
          <p className="mt-3 text-sm font-medium">Start a goal</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add habits as boxes at the top — tap an emoji for streaks, heatmaps, and smart progress.
          </p>
        </div>
      ) : (
        <section aria-label="Your habits">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-0.5">
            {habits.map((habit, index) => (
              <HabitCompactTile
                key={habit.id}
                habit={habit}
                index={index}
                onOpenDetail={() => setDetailId(habit.id)}
                onToggleToday={() => toggle(habit.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-[7.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/[0.12] bg-card/50 p-3 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-current/30">
                <Plus className="size-6" aria-hidden />
              </span>
              <span className="text-xs font-medium">Add habit</span>
            </button>
          </div>
          <p className="mt-2 px-0.5 text-[11px] text-muted-foreground">
            Tap an emoji for the full breakdown · Check in from the tile or inside details
          </p>
        </section>
      )}

      {habits.length === 0 && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="h-11 w-full rounded-xl border border-dashed border-black/[0.12] text-sm font-medium text-primary hover:bg-primary/5"
        >
          + Add your first habit
        </button>
      )}

      <AddHabitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={(name, emoji, goalDays) => {
          create(name, emoji, goalDays);
          setModalOpen(false);
        }}
      />

      <HabitDetailDialog
        habit={detailHabit}
        index={detailIndex >= 0 ? detailIndex : 0}
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        onToggle={toggle}
      />
    </div>
  );
}
