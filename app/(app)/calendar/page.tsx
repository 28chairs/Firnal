import { MonthGrid } from '@/components/calendar/MonthGrid';

export default function CalendarPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 pb-24">
      <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
      <MonthGrid />
    </main>
  );
}
