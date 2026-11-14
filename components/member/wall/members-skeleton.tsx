import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The wall while its members load: the header, the switch and ten portrait
// plates.

export function MembersSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Members" />
      <Skeleton variant="control" className="h-9.5 w-80" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-border">
            <Skeleton variant="plate" className="aspect-square w-full" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
