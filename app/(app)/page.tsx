import { CalendarEventsStrip } from '@/components/home/CalendarEventsStrip';
import { DayFlowchart } from '@/components/home/DayFlowchart';
import { HabitReminders } from '@/components/home/HabitReminders';
import { RecentRecordings } from '@/components/home/RecentRecordings';
import { TodayHeader } from '@/components/home/TodayHeader';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-24">
      <TodayHeader />

      {/* Desktop schedule (mobile schedule lives inside DayTimeline) */}
      <div className="hidden md:block">
        <CalendarEventsStrip />
      </div>

      <DayFlowchart />

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
    </main>
  );
}
