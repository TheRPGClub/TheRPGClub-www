import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The voting page while the round loads: the strip, the tabs and a row of
// cover tiles.
export function VotingSkeleton() {
  return (
    <div className="space-y-7">
      <PageHeader title="Nominations" />
      <Skeleton className="h-48" />
      <div className="space-y-5">
        <Skeleton variant="control" className="h-11.5 w-96 max-w-full" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="card" className="aspect-[3/4] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
