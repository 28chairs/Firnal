'use client';

import { Suspense } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppearanceSettings } from '@/components/profile/AppearanceSettings';
import { GoogleCalendarConnect } from '@/components/profile/GoogleCalendarConnect';
import { detectBrowserTimezone } from '@/lib/timezone';
import { SampleDaysCard } from '@/components/profile/SampleDaysCard';

function GoogleCalendarConnectFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Google Calendar</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking connection...</span>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const timezone = detectBrowserTimezone();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <header className="px-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Settings &amp; preferences</p>
      </header>

      <AppearanceSettings />

      <SampleDaysCard />

      <Suspense fallback={<GoogleCalendarConnectFallback />}>
        <GoogleCalendarConnect />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4" />
            Timezone
          </CardTitle>
          <CardDescription>Detected from your browser</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{timezone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Sign-in — Phase 9</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Magic-link sign-in and cloud sync are coming in Phase 9. For now, your recordings
            are saved on this device.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record from widget</CardTitle>
          <CardDescription>Coming in v2.0</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Home-screen widget for one-tap voice capture — native app phase.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
