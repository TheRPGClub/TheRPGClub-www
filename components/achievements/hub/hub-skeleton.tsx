import { PageHeader } from "@/components/templates/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// The hub while its feed loads: the Provider chips, a day heading, and rows
// of a member beside a run of frames.
export function HubSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" />
      <Skeleton variant="control" className="h-[26px] w-96 max-w-full" />
      <div className="space-y-3">
        <Skeleton variant="text" className="h-8 w-56" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-5 py-2">
            <Skeleton variant="text" className="size-9 shrink-0" />
            <Skeleton variant="text" className="h-5 w-40" />
            <div className="flex gap-1.5">
              {Array.from({ length: 3 + (i % 3) }).map((_, j) => (
                <Skeleton key={j} className="size-[52px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
