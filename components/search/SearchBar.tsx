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
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search your journal…"
        className="h-11 rounded-xl pl-10 pr-10"
        autoFocus={autoFocus}
        aria-label="Search journal"
      />
      {draft.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
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
