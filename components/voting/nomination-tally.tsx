import type { VotingCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { BAR_MOTION } from "./accents";

const FILL: Record<VotingCategory, string> = { gotm: "bg-gotm", nr_gotm: "bg-nr" };

// A nomination's votes once counts are public, with a bar scaled to the
// leader's tally (not an absolute target).
export function NominationTally({
  category,
  count,
  maxCount,
}: {
  category: VotingCategory;
  count: number;
  maxCount: number;
}) {
  return (
    <div>
      <p className="font-label flex items-baseline gap-1.5 text-[0.82rem] font-bold tracking-[0.06em] text-faint-foreground">
        <span className="font-headline text-[1.6rem] leading-none text-foreground tabular-nums">
          {count}
        </span>
        {count === 1 ? "vote" : "votes"}
      </p>
      {/* A meter (votes against the leader), not progress: no Progress. */}
      {maxCount > 0 && (
        <span aria-hidden className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted">
          <span
            className={cn("block h-full", FILL[category], BAR_MOTION)}
            style={{ width: `${(count / maxCount) * 100}%` }}
          />
        </span>
      )}
    </div>
  );
}
