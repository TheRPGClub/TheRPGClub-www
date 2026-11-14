import type { GotmRoundGame } from "@/lib/api/types";
import type { GameCounts } from "@/lib/api/game-counts";
import { LABEL } from "@/components/issue/nr-feature-copy";
import { NrFeatureCard } from "@/components/issue/nr-feature-card";
import { NrFeatureRow } from "@/components/issue/nr-feature-row";

// The issue's NR-GOTM feature beside the GOTM cover story: one winner is a
// feature card (art band, blurb, links), two or three a ranked list of
// covers. Server-only (the Discord link config reads server env vars).

export function NrFeature({
  roundNumber,
  games,
  votingResultsMessageId,
  counts,
}: {
  roundNumber: number;
  games: GotmRoundGame[];
  votingResultsMessageId: string | null;
  // The club's numbers per winner, keyed by GameDB id (feature card only).
  counts?: Record<number, GameCounts>;
}) {
  const winners = [...games]
    .sort((a, b) => a.game_index - b.game_index)
    .slice(0, 3);

  if (winners.length === 1) {
    return (
      <NrFeatureCard
        roundNumber={roundNumber}
        entry={winners[0]}
        votingResultsMessageId={votingResultsMessageId}
        counts={
          winners[0].gamedb_game_id != null
            ? counts?.[winners[0].gamedb_game_id]
            : undefined
        }
      />
    );
  }

  return (
    <section
      aria-label={`${LABEL}, round ${roundNumber}: ${winners.length} winners`}
      className="relative flex flex-col overflow-hidden rounded-md border border-border bg-card"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-nr" />
      <div className="flex items-baseline justify-between gap-3 px-4 pt-4.5 pb-3">
        <h2 className="font-headline text-[1.45rem] leading-none text-nr-soft">
          {LABEL}
        </h2>
        <p className="font-label shrink-0 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground">
          {winners.length} winners
        </p>
      </div>
      <ol className="flex flex-1 flex-col">
        {winners.map((entry, i) => (
          <NrFeatureRow
            key={entry.gamedb_game_id ?? `index-${i}`}
            entry={entry}
            i={i}
            count={winners.length}
          />
        ))}
      </ol>
    </section>
  );
}
