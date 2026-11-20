import { TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRetry } from "./panel-retry";

// A Dashboard Panel's other states (picks: empty C, load error from the
// final round, restyled to B).

// Nothing recent: the panel stays and says so, so the member knows their
// setting still works.
export function PanelEmpty({ note = "All quiet. Nothing new yet." }: { note?: string }) {
  return (
    <p className="my-2 rounded-xs border border-dashed border-border-strong px-4 py-4 text-dim-foreground">
      {note}
    </p>
  );
}

// The source failed: a short error inside this panel only, with a retry
// (`onRetry` from an error boundary; else the dashboard renders again).
export function PanelError({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="my-2 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-3 rounded-xs border border-border-strong px-4 py-3.5 @md:grid-cols-[auto_minmax(0,1fr)_auto] @md:items-center"
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-5 text-destructive @md:mt-0" />
      <div className="min-w-0">
        <p className="font-semibold">Couldn&apos;t load {title}.</p>
        <p className="text-sm text-dim-foreground">The rest of your dashboard is fine.</p>
      </div>
      <PanelRetry onRetry={onRetry} />
    </div>
  );
}

// While the source is read: rows in the panel's shape.
export function PanelSkeleton({ wide }: { wide: boolean }) {
  const rows = wide ? 6 : 4;
  return (
    <div aria-hidden className={wide ? "grid gap-x-7 sm:grid-cols-2" : "grid"}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="size-10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
