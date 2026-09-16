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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors duration-200"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[var(--spacing-nav-height,4rem)] max-w-lg items-end justify-between px-2">
        {tabs.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <TabLink
            key={href}
            href={href}
            label={label}
            icon={Icon}
            active={isActive(pathname, href)}
          />
        ))}

        <div className="relative -top-4 flex flex-col items-center">
          <button
            type="button"
            aria-label="Hold to record (Space bar also works)"
            disabled={disabled}
            className={cn(
              'group flex size-16 items-center justify-center rounded-full bg-fab text-fab-foreground transition-all duration-200 touch-none select-none disabled:opacity-60',
              'fab-glow hover:scale-105 active:scale-95',
              isRecording && 'scale-110 ring-4 ring-fab/30 animate-pulse'
            )}
            onPointerDown={(e) => {
              e.preventDefault();
              onFabPointerDown();
            }}
            onPointerUp={onFabPointerUp}
            onPointerLeave={onFabPointerLeave}
            onPointerCancel={onFabPointerLeave}
          >
            <MicIcon className={cn('transition-transform duration-200', isRecording && 'scale-110')} />
          </button>
        </div>

        {tabs.slice(2).map(({ href, label, icon: Icon }) => (
          <TabLink
            key={href}
            href={href}
            label={label}
            icon={Icon}
            active={isActive(pathname, href)}
          />
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
        'flex min-w-[4.5rem] flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-all duration-200',
        active
          ? 'text-primary font-semibold scale-[1.02]'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon
        className={cn(
          'size-[var(--spacing-nav-icon,1.25rem)] transition-transform duration-200',
          active && 'scale-105'
        )}
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-7', className)}
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
