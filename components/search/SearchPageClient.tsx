'use client';

import { useCallback, useMemo, useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { searchLocalJournals } from '@/lib/local-search';

export function SearchPageClient() {
  const [query, setQuery] = useState('');

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const results = useMemo(() => searchLocalJournals(query), [query]);

  return (
    <div className="flex flex-col gap-4">
      <SearchBar onChange={handleQueryChange} autoFocus />
      <SearchResults query={query} results={results} />
    </div>
  );
}
