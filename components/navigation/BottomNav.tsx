'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Home, User, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type BottomNavProps = {
  onFabPointerDown: () => void;
  onFabPointerUp: () => void;
  onFabPointerLeave: () => void;
  isRecording: boolean;
  disabled?: boolean;
};

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomNav({
  onFabPointerDown,
  onFabPointerUp,
  onFabPointerLeave,
  isRecording,
  disabled = false,
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-end justify-between px-2">
        {tabs.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <TabLink key={href} href={href} label={label} icon={Icon} active={isActive(pathname, href)} />
        ))}

        <div className="relative -top-4 flex flex-col items-center">
          <button
            type="button"
            aria-label="Hold to record (Space bar also works)"
            disabled={disabled}
            className={cn(
              'flex size-16 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-[0_4px_16px_rgba(101,129,162,0.45)] transition-transform touch-none select-none disabled:opacity-60',
              isRecording && 'scale-105 ring-4 ring-fab/25'
            )}
            onPointerDown={(e) => {
              e.preventDefault();
              onFabPointerDown();
            }}
            onPointerUp={onFabPointerUp}
            onPointerLeave={onFabPointerLeave}
            onPointerCancel={onFabPointerLeave}
          >
            <MicIcon />
          </button>
        </div>

        {tabs.slice(2).map(({ href, label, icon: Icon }) => (
          <TabLink key={href} href={href} label={label} icon={Icon} active={isActive(pathname, href)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-w-[4.5rem] flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
        active ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7"
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
