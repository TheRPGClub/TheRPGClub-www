import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The News page while its feed loads: the header, the rail's rows (from
// lg) and a band of card-shaped plates.

export function NewsSkeleton({ badge }: { badge: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        badge={badge}
        actions={<Skeleton variant="text" className="h-4 w-44" />}
      />
      <div className="gap-x-7 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <div className="hidden space-y-2 lg:block">
          <Skeleton variant="text" className="h-4 w-32" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton variant="text" key={i} className="h-[30px]" />
          ))}
        </div>
        <div className="@container min-w-0 space-y-3">
          <Skeleton variant="control" className="h-9 w-24 lg:hidden" />
          <Skeleton variant="text" className="h-7 w-56" />
          <div className="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
