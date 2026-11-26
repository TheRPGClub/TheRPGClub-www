import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The GOTM History while the archive loads: the year rail and three rows,
// each a round-numeral tab over a pair of banners.
export function GotmHistorySkeleton() {
  return (
    <div className="space-y-5">
      <PageHeader title="GOTM history" />
      <div className="grid gap-4 lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-6">
        <div className="flex gap-3 lg:flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="control" className="h-7 w-14" />
          ))}
        </div>
        <div className="space-y-6 sm:space-y-6.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <Skeleton variant="text" className="h-6.5 w-40 sm:h-7.5 sm:w-56" />
              <div className="grid auto-rows-[9.625rem] gap-1.5 sm:h-54 sm:auto-rows-auto sm:grid-cols-2 sm:gap-x-3.75">
                <Skeleton variant="card" className="h-full" />
                <Skeleton variant="card" className="h-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
