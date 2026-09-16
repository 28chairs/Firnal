import { AppShell } from '@/components/navigation/AppShell';
import { NativeShell } from '@/components/navigation/NativeShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NativeShell>
      <AppShell>{children}</AppShell>
    </NativeShell>
  );
}
