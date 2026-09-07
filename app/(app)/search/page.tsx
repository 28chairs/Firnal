import { SearchPageClient } from '@/components/search/SearchPageClient';

export default function SearchPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <header className="px-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">
          Find keywords across recordings and daily flowcharts
        </p>
      </header>
      <SearchPageClient />
    </main>
  );
}
