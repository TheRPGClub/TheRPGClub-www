import type { GotyAwardKey } from "@/lib/goty/types";
import { cn } from "@/lib/utils";

// The viewer's votes against the Award's cap as a row of ticks, the used
// ones in yellow (the member's own business).
export function CapTicks({ award, used, cap }: { award: GotyAwardKey; used: number; cap: number }) {
  return (
    <span role="img" aria-label={`${used} of ${cap} votes used`} data-award={award} className="flex gap-1.25">
      {Array.from({ length: cap }, (_, i) => (
        <i key={i} className={cn("h-2 w-5.5 rounded-[1px] motion-safe:transition-colors", i < used ? "bg-highlight" : "bg-muted")} />
      ))}
    </span>
  );
}
