import { Skeleton } from "@/components/ui/skeleton";

// The Round Page while the round loads: the title, the diptych and the two
// Category columns.
export function RoundPageSkeleton() {
  return (
    <div aria-busy className="space-y-6">
      <div className="space-y-3 border-b-2 border-border pb-3">
        <Skeleton variant="text" className="h-4 w-28" />
        <Skeleton variant="text" className="h-12 w-72 max-w-full" />
      </div>
      <div className="grid h-64 grid-cols-2 gap-1.5 md:h-74 md:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)] md:gap-0">
        <Skeleton variant="plate" className="h-full" />
        <div className="max-md:hidden" />
        <Skeleton variant="plate" className="h-full" />
      </div>
      <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)] md:gap-0">
        <ColumnSkeleton />
        <div className="max-md:hidden" />
        <ColumnSkeleton />
      </div>
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" className="h-6 w-48" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="card" className="h-17.5 w-13 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-2/3" />
            <Skeleton variant="text" className="h-3 w-1/3" />
            <Skeleton variant="text" className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
