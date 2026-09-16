'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { seedThreeSampleDays } from '@/lib/sample-data';

export function SampleDaysCard() {
  const [status, setStatus] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          Sample days
        </CardTitle>
        <CardDescription>Preview Home, Calendar, and Habits with realistic data</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Loads 3 days of voice notes, flowcharts, and habit check-ins on this device.
        </p>
        <Button
          type="button"
          className="min-h-11 w-full"
          onClick={() => {
            const { dates } = seedThreeSampleDays({ force: true });
            setStatus(`Loaded ${dates.join(', ')}. Open Home or Calendar.`);
          }}
        >
          Load 3 sample days
        </Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
