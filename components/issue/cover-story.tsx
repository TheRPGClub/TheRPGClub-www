import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { Starburst } from "@/components/issue/starburst";
import { CoverPanel } from "@/components/issue/cover-panel";
import { SIZES, TRACK } from "@/components/issue/cover-track";
import type { GameCounts } from "@/lib/api/game-counts";
import { Ornament } from "@/components/ornament";
import { cn } from "@/lib/utils";

// The issue's cover story: a round's winners for one track, full-bleed key art
// under a monumental round number. GOTM is normally the cover; NR-GOTM takes
// it only when a round has no GOTM. Co-winners share the one cover: two split
// it, three put a lead panel beside two stacked ones. Server-only (the
// Discord link config reads server env vars). A Theme places the winner mark
// by the story's slot, track and winner count (data-count).
export function CoverStory({
  kind,
  roundNumber,
  monthYear,
  games,
  votingResultsMessageId,
  absentNote,
  counts,
}: {
  kind: VotingCategory;
  roundNumber: number;
  monthYear: string;
  games: GotmRoundGame[];
  votingResultsMessageId: string | null;
  // Shown under the masthead when the other track has no winner this round.
  absentNote?: string;
  // The club's numbers per winner, keyed by GameDB id; a missing entry
  // leaves that panel's stats out rather than showing zeros.
  counts?: Record<number, GameCounts>;
}) {
  const track = TRACK[kind];
  const winners = [...games]
    .sort((a, b) => a.game_index - b.game_index)
    .slice(0, 3);
  const count = winners.length;
  const sizes = SIZES[count] ?? SIZES[3];

  return (
    <section
      aria-label={`${track.label}, round ${roundNumber}${count > 1 ? `: ${count} winners` : ""}`}
      data-slot="cover-story"
      data-track={kind}
      data-count={count}
      className={cn(
        "relative grid min-h-[30rem] gap-1 overflow-hidden rounded-md bg-background lg:min-h-[32rem]",
        count === 2 && "sm:grid-cols-[1.42fr_1fr]",
        count === 3 && "sm:grid-cols-[1.3fr_1fr] sm:grid-rows-2",
      )}
    >
      {/* A Theme's gloss over the key art (none under Monthly Issue). */}
      <Ornament role="glare" motion="sweep" />
      <Starburst track={kind} className="absolute z-10" textClassName="" />
      {winners.map((entry, i) => (
        <CoverPanel
          key={entry.gamedb_game_id ?? `index-${i}`}
          kind={kind}
          entry={entry}
          index={i}
          count={count}
          size={sizes[i]}
          lead={i === 0}
          roundNumber={roundNumber}
          monthYear={monthYear}
          votingResultsMessageId={votingResultsMessageId}
          absentNote={i === 0 ? absentNote : undefined}
          counts={
            entry.gamedb_game_id != null
              ? counts?.[entry.gamedb_game_id]
              : undefined
          }
        />
      ))}
    </section>
  );
}
