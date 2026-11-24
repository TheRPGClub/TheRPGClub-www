import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The hub while its feed loads, shaped like the day walls it is loading.
export function HubSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeader title="Achievements" />
      <div className="space-y-4">
        <Skeleton variant="text" className="h-[26px] w-96 max-w-full" />
        <Skeleton variant="text" className="h-7 w-40" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-48 sm:col-span-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}
