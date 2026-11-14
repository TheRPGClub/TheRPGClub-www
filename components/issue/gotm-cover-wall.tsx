import type { GotmRound, VotingCategory } from "@/lib/api/types";
import { RoundCover } from "@/components/issue/gotm-cover-wall-round";
import { groupByYear, sortedWinners } from "@/components/issue/gotm-shared";

// The GOTM history narrowed to one track: every round gets its own cover,
// the round number monumental in the track's ink over the winner's key art.
// Co-winners are listed under the lead headline. Server-only (the Discord
// link config reads server env vars).

export function GotmCoverWall({
  kind,
  rounds,
}: {
  kind: VotingCategory;
  rounds: GotmRound[];
}) {
  return (
    <div className="space-y-8">
      {groupByYear(rounds).map((group, gi) => (
        <section
          key={`${group.year ?? "undated"}-${gi}`}
          aria-labelledby={`year-${group.year ?? "undated"}-${gi}`}
          className="space-y-5"
        >
          <h2
            id={`year-${group.year ?? "undated"}-${gi}`}
            className="font-headline flex flex-wrap items-baseline gap-x-3 border-b-2 border-foreground pb-2 text-[2.5rem] leading-none"
          >
            {group.year ?? "Undated"}
            <span className="font-label text-sm font-bold tracking-[0.08em] text-faint-foreground">
              {group.rounds.length}{" "}
              {group.rounds.length === 1 ? "round" : "rounds"} on this page
            </span>
          </h2>
          <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {group.rounds.map((round) => {
              const block = round[kind];
              if (!block) return null;
              return (
                <li key={round.round_number} className="flex">
                  <RoundCover
                    kind={kind}
                    roundNumber={round.round_number}
                    monthYear={block.month_year}
                    winners={sortedWinners(block.games)}
                    votingResultsMessageId={block.voting_results_message_id}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
