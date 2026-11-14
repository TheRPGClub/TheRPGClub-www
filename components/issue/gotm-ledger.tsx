import type { GotmRound } from "@/lib/api/types";
import { groupByYear } from "@/components/issue/gotm-shared";
import { LedgerRow } from "@/components/issue/gotm-ledger-row";

// The GOTM history with both tracks: a ledger of rounds, each a monumental
// round number beside its GOTM art panels and its NR-GOTM art panels.
// Co-winners split their track's column. Server-only (the Discord link
// config reads server env vars).

export function GotmLedger({
  rounds,
  searching,
}: {
  rounds: GotmRound[];
  // A title search drops the other track's non-matching block, so its
  // absence means "no match", not "no winner".
  searching: boolean;
}) {
  return (
    <div className="space-y-2">
      {groupByYear(rounds).map((group, gi) => (
        <section
          key={`${group.year ?? "undated"}-${gi}`}
          aria-label={group.year ? String(group.year) : "Undated rounds"}
        >
          {group.year && (
            <h2 className="font-headline border-b-2 border-foreground pt-2 pb-1.5 text-[1.4rem] text-faint-foreground">
              {group.year}
            </h2>
          )}
          <ol>
            {group.rounds.map((round) => (
              <LedgerRow
                key={round.round_number}
                round={round}
                searching={searching}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
