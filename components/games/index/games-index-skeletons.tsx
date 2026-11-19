import { Skeleton } from "@/components/ui/skeleton";

// The game index's sections while they stream in.

export function LeadSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-[1.5fr_1fr_1fr]">
      <Skeleton variant="plate" className="col-span-2 h-60 md:col-span-1 md:h-75" />
      <Skeleton variant="plate" className="h-50 md:h-75" />
      <Skeleton variant="plate" className="h-50 md:h-75" />
    </div>
  );
}

export function NewestSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="control" className="h-10 w-64" />
      <div className="flex gap-3.5 overflow-hidden pt-2.5 xl:gap-4.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton variant="card"
            key={i}
            className="aspect-[3/4] w-[42vw] max-w-44 shrink-0 sm:w-40 xl:w-44"
          />
        ))}
      </div>
    </div>
  );
}

export function GamesGridSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton variant="control" className="h-10 w-64" />
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 xl:gap-x-4.5 xl:gap-y-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="card" className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacetFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton variant="control" key={i} className="h-9 w-36" />
      ))}
    </div>
  );
}
