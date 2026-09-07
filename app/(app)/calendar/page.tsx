import { MonthGrid } from '@/components/calendar/MonthGrid';

export default function CalendarPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <header className="px-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">
          Days with recordings show a dot — tap to revisit your flowchart
        </p>
      </header>
      <MonthGrid />
    </main>
  );
}
