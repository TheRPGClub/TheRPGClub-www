import type { VotingCategory } from "@/lib/api/types";
import { Starburst } from "@/components/issue/starburst";
import { cn } from "@/lib/utils";

// The starburst at badge scale, for a winner inside a grid or a panel where
// the full three-line burst would not read. Same rule: it marks a GOTM or
// NR-GOTM win and nothing else. Still (no stamp-in): a grid can hold a dozen.
//
// Decorative; the caller states the win in text (a meta line or a label).

const LINES: Record<VotingCategory, readonly string[]> = {
  gotm: ["GOTM"],
  nr_gotm: ["NR", "GOTM"],
};

export function WinnerMark({
  track,
  className,
}: {
  track: VotingCategory;
  // Size and position, e.g. "absolute -top-2.5 -right-2.5 size-15".
  className?: string;
}) {
  return (
    <Starburst
      track={track}
      lines={LINES[track]}
      rotate={-10}
      still
      className={cn("z-10", className)}
      textClassName="text-[0.8rem] leading-[0.95] tracking-[0.02em]"
    />
  );
}
