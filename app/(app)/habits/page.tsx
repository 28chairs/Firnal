import { HabitList } from '@/components/habits/HabitList';

export default function HabitsPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 pb-24">
      <h1 className="text-xl font-semibold tracking-tight">Habits</h1>
      <HabitList />
    </main>
  );
}
