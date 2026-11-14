import type { VotingCategory } from "@/lib/api/types";
import type { TallyLine } from "@/lib/voting-console";
import { cn } from "@/lib/utils";

export const TRACK_INK = {
  gotm: { rule: "border-gotm", soft: "text-gotm-soft", bar: "bg-gotm" },
  nr_gotm: { rule: "border-nr", soft: "text-nr-soft", bar: "bg-nr" },
} as const;

// A tally's lines: each game's votes as a big numeral and a bar against the
// leader, the leader in the track's soft ink, the also-rans dimmed. Before
// the vote opens (no counts) a dot stands in for the numeral.
export function TallyLines({
  lines,
  ink,
  showCounts,
}: {
  lines: TallyLine[];
  ink: (typeof TRACK_INK)[VotingCategory];
  showCounts: boolean;
}) {
  const top = lines[0]?.count ?? 0;
  return (
    <ol>
      {lines.map((line, i) => {
        const lead = showCounts && top > 0 && line.count === top;
        const dim = showCounts && !lead && (i >= 2 || line.count === 0);
        return (
          <li
            key={line.gameId}
            className="grid grid-cols-[3.2rem_minmax(0,1fr)] items-center gap-3 border-b border-border py-2.25"
          >
            <span
              className={cn(
                "font-headline text-right text-[2.2rem] leading-[0.85] tabular-nums",
                lead ? ink.soft : showCounts ? "text-foreground" : "text-faint-foreground",
              )}
            >
              {showCounts ? line.count : "·"}
            </span>
            <div className="min-w-0">
              <p className={cn("leading-tight", dim ? "text-dim-foreground" : "font-semibold text-foreground")}>
                {line.title}
                {showCounts && <span className="sr-only">, {line.count} {line.count === 1 ? "vote" : "votes"}</span>}
              </p>
              {/* A meter (votes against the leader), not progress: no Progress. */}
              {showCounts && top > 0 && (
                <i
                  aria-hidden
                  className={cn("mt-1.5 block h-[3px]", ink.bar)}
                  style={{ width: `${(line.count / top) * 100}%` }}
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
