import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The page while its members load: the header, the search and three tiers of
// avatar discs.

const TIER_SIZES = [3, 4, 18];

export function MembersSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Members" />
      <Skeleton variant="control" className="h-10 w-full sm:max-w-sm" />
      <div className="border-t border-border">
        {TIER_SIZES.map((size, i) => (
          <div
            key={i}
            className="grid gap-3 border-b border-border py-5 md:grid-cols-[11rem_1fr] md:gap-6 md:py-6"
          >
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {Array.from({ length: size }).map((_, j) => (
                <Skeleton key={j} variant="avatar" className="size-12 sm:size-14" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
