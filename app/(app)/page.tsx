import { CalendarEventsStrip } from '@/components/home/CalendarEventsStrip';
import { DayFlowchart } from '@/components/home/DayFlowchart';
import { HabitReminders } from '@/components/home/HabitReminders';
import { RecentRecordings } from '@/components/home/RecentRecordings';
import { TodayHeader } from '@/components/home/TodayHeader';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-24">
      <TodayHeader />

      <CalendarEventsStrip />

      <DayFlowchart />

      <HabitReminders />

      <section className="flex flex-col gap-3">
        <h2 className="px-0.5 text-sm font-medium text-muted-foreground">
          Recent recordings
        </h2>
        <RecentRecordings />
      </section>
    </main>
  );
}
