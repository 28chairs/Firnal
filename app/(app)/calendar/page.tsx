import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <header className="px-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Browse past journal days</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Month view</CardTitle>
          <CardDescription>Coming in Phase 5</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Days you&apos;ve recorded will show dots on the calendar grid.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
