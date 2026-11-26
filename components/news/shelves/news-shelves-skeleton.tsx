import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The Shelves tab while its read loads: the masthead, the tabs' hairline,
// the lead row and the first two shelves.

export function NewsShelvesSkeleton({ badge }: { badge: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title="News" badge={badge} actions={<Skeleton variant="control" className="h-9 w-72" />} />
      <Skeleton variant="text" className="h-8 w-48" />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <Skeleton className="min-h-[15rem] sm:col-span-2 lg:col-span-1 lg:min-h-[13rem]" />
        <Skeleton className="min-h-[12rem] lg:min-h-[13rem]" />
        <Skeleton className="min-h-[12rem] lg:min-h-[13rem]" />
      </div>
      {Array.from({ length: 2 }).map((_, shelf) => (
        <div key={shelf} className="space-y-2.5">
          <Skeleton variant="text" className="h-5 w-64" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-[14.75rem] shrink-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
