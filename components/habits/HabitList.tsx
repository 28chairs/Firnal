'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { AddHabitModal } from '@/components/habits/AddHabitModal';
import { HabitCompactTile } from '@/components/habits/HabitCompactTile';
import { HabitDetailPanel } from '@/components/habits/HabitDetailPanel';
import { HabitsTodayBanner } from '@/components/habits/HabitsTodayBanner';
import { useHabits } from '@/hooks/useHabits';
import { detectBrowserTimezone, getTodayDateString } from '@/lib/timezone';

export function HabitList() {
  const date = getTodayDateString(detectBrowserTimezone());
  const { habits, create, toggle } = useHabits(date);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const detailIndex = habits.findIndex((habit) => habit.id === detailId);
  const detailHabit = detailIndex >= 0 ? habits[detailIndex] : null;

  const toggleDetail = (habitId: string) => {
    setDetailId((current) => (current === habitId ? null : habitId));
  };

  useEffect(() => {
    if (!detailId || !panelRef.current) return;
    panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [detailId]);

  return (
    <div className="flex flex-col gap-4">
      <HabitsTodayBanner habits={habits} />

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Start a goal</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Add habits as tiles at the top. Tap the emoji to see streaks, heatmaps, and smart progress.
          </p>
        </div>
      ) : (
        <section aria-label="Your habits" className="flex flex-col gap-4">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pt-0.5">
            {habits.map((habit, index) => (
              <HabitCompactTile
                key={habit.id}
                habit={habit}
                index={index}
                selected={detailId === habit.id}
                onOpenDetail={() => toggleDetail(habit.id)}
                onToggleToday={() => toggle(habit.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-[7.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-card/50 p-3 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl border-2 border-dashed border-current/30 transition-transform duration-200 group-hover:scale-105">
                <Plus className="size-6" aria-hidden />
              </span>
              <span className="text-xs font-medium">Add habit</span>
            </button>
          </div>

          {detailHabit ? (
            <div ref={panelRef}>
              <HabitDetailPanel
                habit={detailHabit}
                index={detailIndex}
                onClose={() => setDetailId(null)}
                onToggle={toggle}
              />
            </div>
          ) : (
            <p className="px-0.5 text-center text-xs text-muted-foreground">
              Tap an emoji to see the breakdown below
            </p>
          )}
        </section>
      )}

      {habits.length === 0 && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="h-12 w-full rounded-2xl border-2 border-dashed border-border/60 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
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
    </div>
  );
}
