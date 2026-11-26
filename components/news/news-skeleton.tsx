import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The News page while its feed loads: the masthead, the tabs' hairline, the
// hero band's count and art, and the mosaic's first row.

export function NewsSkeleton({ badge }: { badge: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        badge={badge}
        actions={<Skeleton variant="control" className="h-9 w-72" />}
      />
      <Skeleton variant="text" className="h-8 w-48" />
      <div className="grid gap-5 lg:min-h-[23.25rem] lg:grid-cols-[18.75rem_minmax(0,1fr)]">
        <div className="space-y-3">
          <Skeleton variant="text" className="h-32 w-40" />
          <Skeleton variant="text" className="h-5 w-48" />
        </div>
        <Skeleton className="min-h-[20rem]" />
      </div>
      <div className="grid gap-2.5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[9.125rem]" />
        ))}
      </div>
    </div>
  );
}
