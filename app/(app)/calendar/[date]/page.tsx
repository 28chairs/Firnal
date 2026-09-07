import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DayFlowchart } from '@/components/home/DayFlowchart';
import { RecentRecordings } from '@/components/home/RecentRecordings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DayDetailPageProps = {
  params: Promise<{ date: string }>;
};

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function DayDetailPage({ params }: DayDetailPageProps) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <header className="flex flex-col gap-3 px-0.5">
        <Link
          href="/calendar"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit gap-1.5 px-2')}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Calendar
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{formatDateLabel(date)}</h1>
          <p className="mt-0.5 text-[15px] text-muted-foreground">{date}</p>
        </div>
      </header>

      <DayFlowchart date={date} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentRecordings date={date} />
        </CardContent>
      </Card>
    </main>
  );
}
