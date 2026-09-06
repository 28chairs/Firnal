'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detectBrowserTimezone } from '@/lib/timezone';

export default function ProfilePage() {
  const timezone = detectBrowserTimezone();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <header className="px-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Settings</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Sign-in — Phase 9</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">
            Magic-link sign-in and cloud sync are coming in Phase 9. For now, your recordings
            are saved on this device.
          </p>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Timezone</span>
            <span className="font-medium">{timezone}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Calendar</CardTitle>
          <CardDescription>Phase 6</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect Google Calendar to see today&apos;s events on Home.
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
