import { Skeleton } from '@/components/ui/skeleton';

export default function AppLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-24">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>

      <Skeleton className="h-20 w-full rounded-xl" />

      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </main>
  );
}
