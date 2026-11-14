import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The GOTM history while the archive loads: the rail and three ledger rows.
export function GotmHistorySkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="GOTM history" />
      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="space-y-2">
          <Skeleton variant="control" className="h-9.5 w-full" />
          <Skeleton variant="control" className="h-9.5 w-full" />
          <Skeleton variant="control" className="h-9.5 w-full" />
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-4 xl:grid-cols-[8.5rem_minmax(0,1.6fr)_minmax(0,1fr)]"
            >
              <Skeleton variant="card" className="h-20 w-28" />
              <Skeleton variant="card" className="h-49" />
              <Skeleton variant="card" className="h-49" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
