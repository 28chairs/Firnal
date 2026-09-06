import { HabitList } from '@/components/habits/HabitList';

export default function HabitsPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <header className="px-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">
          Goal-based check-ins with streaks and breakdowns
        </p>
      </header>

      <HabitList />
    </main>
  );
}
