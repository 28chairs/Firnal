import { DayFlowchart } from '@/components/home/DayFlowchart';
import { HabitReminders } from '@/components/home/HabitReminders';
import { RecentRecordings } from '@/components/home/RecentRecordings';
import { TodayHeader } from '@/components/home/TodayHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <TodayHeader />

      <DayFlowchart />

      <HabitReminders />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentRecordings />
        </CardContent>
      </Card>
    </main>
  );
}
