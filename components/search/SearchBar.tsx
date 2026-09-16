'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SearchBarProps = {
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

export function SearchBar({ onChange, autoFocus = false }: SearchBarProps) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onChange(draft), 300);
    return () => clearTimeout(timer);
  }, [draft, onChange]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search your journal…"
        className="h-12 rounded-2xl border-2 border-border/60 bg-card pl-12 pr-12 text-base shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 focus:border-primary/50 focus:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
        autoFocus={autoFocus}
        aria-label="Search journal"
      />
      {draft.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-xl transition-colors hover:bg-muted"
          onClick={() => {
            setDraft('');
            onChange('');
          }}
          aria-label="Clear search"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
