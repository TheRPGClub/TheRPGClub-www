import { Skeleton } from "@/components/ui/skeleton";

// The rail's facts while they stream in.
export function RailDetailsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="control" className="h-7 w-28" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton variant="control" key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

// The rail's Releases while they stream in: the heading, then a few platform
// rows.
export function RailReleasesSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="control" className="h-7 w-28" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton variant="control" key={i} className="h-6 w-full" />
      ))}
    </div>
  );
}

// The whole game page while the game is read: the hero plate, then the
// reviews column beside the rail.
export function GamePageSkeleton() {
  return (
    <div className="pb-8">
      <Skeleton variant="plate" className="bleed -mt-6 h-[420px]" />
      <div className="mt-7.5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <div className="space-y-4">
          <Skeleton variant="control" className="h-10 w-56" />
          <Skeleton className="h-18 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton variant="card" className="h-20 w-full" />
          <Skeleton variant="card" className="h-20 w-full" />
          <RailDetailsSkeleton />
        </div>
      </div>
    </div>
  );
}
