import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">FIRNAL</CardTitle>
          <CardDescription>Voice-first AI journaling — Phase 0 scaffold</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Hold the mic, ramble about your day, and let AI organize it for you.
          </p>
          <Button size="lg" className="rounded-full bg-fab px-8 text-fab-foreground hover:bg-fab/90">
            Hold to record
          </Button>
          <p className="text-xs text-muted-foreground">Recording UI arrives in Phase 2</p>
        </CardContent>
      </Card>
    </div>
  );
}
