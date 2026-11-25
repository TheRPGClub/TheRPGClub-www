import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The GOTM History while the archive loads: the year rail and three diptych
// rows, a leaf either side of the hinge.
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
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid h-50 grid-cols-2 gap-1.5 sm:h-57 sm:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)] sm:gap-0"
            >
              <Skeleton variant="card" className="h-full" />
              <div aria-hidden className="hidden sm:block" />
              <Skeleton variant="card" className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
