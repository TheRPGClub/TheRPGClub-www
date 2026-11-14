import type { AchievementFeedFilters as Filters } from "@/lib/api/achievement-feed";
import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The hub while its feed loads, shaped like the view it is loading.
export function HubSkeleton({ view }: { view: Filters["view"] }) {
  return (
    <div className="space-y-5">
      <PageHeader title="Achievements" actions={<Skeleton variant="control" className="h-[34px] w-56" />} />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <div className="space-y-4">
          <Skeleton variant="text" className="h-[26px] w-96 max-w-full" />
          <Skeleton variant="text" className="h-7 w-40" />
          {view === "latest" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-48 sm:col-span-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52" />
              ))}
            </div>
          )}
        </div>
        {view === "latest" && (
          <div className="hidden space-y-3 xl:block">
            <Skeleton className="h-9 w-64" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
