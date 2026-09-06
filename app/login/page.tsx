import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Scheduled for Phase 9</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Magic-link sign-in and cloud sync are coming in Phase 9. The app works without an
            account — recordings are saved on this device.
          </p>
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full bg-fab text-fab-foreground hover:bg-fab/90',
            )}
          >
            Continue to app
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
