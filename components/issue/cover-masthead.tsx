import type { VotingCategory } from "@/lib/api/types";
import { TRACK } from "@/components/issue/cover-track";
import { cn } from "@/lib/utils";

// A cover panel's header band: on the lead, the monumental round number, the
// winner count and the absent-track note. Side-by-side co-winners share a
// masthead-height band (empty on the second panel), so both stories start at
// the same line and their action rows sit on the same floor.
export function CoverMasthead({
  kind,
  lead,
  split,
  count,
  roundNumber,
  monthYear,
  absentNote,
}: {
  kind: VotingCategory;
  lead: boolean;
  split: boolean;
  count: number;
  roundNumber: number;
  monthYear: string;
  absentNote?: string;
}) {
  if (!lead && !split) return null;
  return (
    <div
      className={cn(
        "space-y-2",
        split && "sm:min-h-36",
        !lead && "hidden sm:block",
      )}
    >
      {lead && (
        <>
          <div className="flex items-end gap-3.5">
            <p
              data-slot="cover-masthead-number"
              className={cn(
                "font-headline text-[5.75rem] leading-[0.8] tracking-[-0.01em]",
                TRACK[kind].number,
              )}
            >
              {roundNumber}
            </p>
            <p data-slot="cover-masthead-round" className="font-label pb-0.5 text-[0.95rem] leading-tight font-extrabold tracking-[0.08em]">
              Round {roundNumber}
              <span data-slot="cover-masthead-month" className="block font-bold text-faint-foreground">
                {monthYear}
              </span>
            </p>
          </div>
          {count > 1 && (
            <p data-slot="cover-winner-count" className="font-label inline-flex rounded-xs bg-foreground px-1.5 py-px text-[0.8rem] font-extrabold tracking-[0.08em] text-background">
              {count} winners
            </p>
          )}
          {absentNote && (
            <p data-slot="cover-absent-note" className="font-label flex items-center gap-2 text-[0.82rem] tracking-[0.08em] text-faint-foreground">
              <span
                aria-hidden
                className="size-2.5 rounded-full ring-2 ring-gotm ring-inset"
              />
              {absentNote}
            </p>
          )}
        </>
      )}
    </div>
  );
}
