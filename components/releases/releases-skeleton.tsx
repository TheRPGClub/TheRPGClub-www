import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The Release Calendar while it loads: the header, the toolbar, then the
// month as a grid of day plates (from lg) or phone tiles.
export function ReleasesSkeleton({ badge }: { badge: React.ReactNode }) {
  return (
    <div>
      <PageHeader
        title="Release Calendar"
        badge={badge}
        actions={<Skeleton variant="text" className="h-4 w-48" />}
      />
      <div className="mt-[18px] flex flex-wrap items-center gap-2">
        <Skeleton variant="control" className="size-9" />
        <Skeleton variant="text" className="h-8 flex-1 sm:mx-2 sm:w-[250px] sm:flex-none" />
        <Skeleton variant="control" className="size-9" />
        <Skeleton variant="control" className="h-7 w-16" />
        <Skeleton variant="control" className="h-9 w-full sm:ml-auto sm:w-[230px]" />
      </div>
      <div className="mt-4 hidden grid-cols-7 gap-px lg:grid">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-33" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-7 gap-[3px] lg:hidden">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-[50px]" />
        ))}
      </div>
    </div>
  );
}
