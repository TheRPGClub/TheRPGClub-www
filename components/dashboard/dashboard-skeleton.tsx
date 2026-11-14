import { Skeleton } from "@/components/ui/skeleton";

// The dashboard's shape while the issue is read: the cover, the feature and
// panel beside it, and the previous rounds.
export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
        <Skeleton className="min-h-[30rem] lg:min-h-[32rem]" />
        <div className="grid gap-5 lg:grid-rows-[1fr_auto]">
          <Skeleton className="min-h-60" />
          <Skeleton className="h-40" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="control" className="h-10 w-72" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton variant="card" key={i} className="h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
