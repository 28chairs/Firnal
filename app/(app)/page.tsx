import { DayFlowchart } from '@/components/home/DayFlowchart';
import { HabitReminders } from '@/components/home/HabitReminders';
import { RecentRecordings } from '@/components/home/RecentRecordings';
import { TodayHeader } from '@/components/home/TodayHeader';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col p-4 pb-24">
      {/* Hero stack: header + flowchart fill first screen on phone */}
      <section className="flex min-h-[calc(100svh-6rem)] flex-col gap-3">
        <TodayHeader />
        <DayFlowchart />
      </section>

      {/* Below-fold content: demoted and compact */}
      <section className="mt-4 flex flex-col gap-3">
        <HabitReminders />

        <details className="group rounded-2xl border border-border/60 bg-card/50">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground marker:content-none">
            Recent recordings
            <span className="text-xs text-muted-foreground/80 group-open:hidden">Show</span>
            <span className="hidden text-xs text-muted-foreground/80 group-open:inline">Hide</span>
          </summary>
          <div className="border-t border-border/60 px-4 py-3">
            <RecentRecordings />
          </div>
        </details>
      </section>
    </main>
  );
}
