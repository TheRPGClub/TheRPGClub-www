import { Skeleton } from "@/components/ui/skeleton";

// A page while it renders on the server: a masthead on its rule, a control
// row and a run of cards. Each section's loading.tsx shows it the moment a
// link is clicked (and Next prefetches it), so a navigation answers at once
// instead of waiting on the API with the old page still up.
export function RouteSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <div className="flex items-end gap-5 border-b-2 border-border pb-3">
        <Skeleton variant="text" className="h-12 w-56 sm:h-14 sm:w-72" />
        <Skeleton variant="text" className="mb-1 h-4 w-28" />
      </div>
      <Skeleton variant="control" className="h-11 w-full max-w-xl" />
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 xl:gap-x-4.5 xl:gap-y-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="card" className="aspect-[3/4] w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
