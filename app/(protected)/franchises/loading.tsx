import { Skeleton } from "@/components/ui/skeleton";
import { FranchiseWallSkeleton } from "@/components/franchises/index/franchise-wall";

// /franchises while it renders: the head on its rule, the search and the
// wall of box sets. A Franchise's own page has its own (franchises/[id]).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <div className="flex items-end gap-5 border-b-2 border-border pb-3">
        <Skeleton variant="text" className="h-12 w-64 sm:h-14 sm:w-80" />
        <Skeleton variant="text" className="mb-1 h-4 w-12" />
      </div>
      <Skeleton variant="control" className="h-11.5 w-full max-w-[26rem]" />
      <FranchiseWallSkeleton />
    </div>
  );
}
