import type { ReactNode } from "react";
import { Gamepad2, Trophy } from "lucide-react";
import type { GotmRoundBlock as GotmRoundBlockData, VotingCategory } from "@/lib/api/types";
import { GotmCard, gotmCardProps } from "@/components/gotm-card";
import { SectionHeader } from "@/components/section-header";
import { gotmLinks } from "@/lib/gotm-links";

// One kind's winners for a round, from the `gotm_rounds` shape: the shared
// SectionHeader over a grid of GotmCards with their Reddit / thread / voting
// links. Used by the dashboard's current round and the GOTM history archive.
// Server-only: the Discord link config reads server env vars.

const KIND = {
  gotm: {
    title: "Game of the Month",
    label: "Game of the Month",
    compactLabel: "GOTM",
    accent: "brand",
    Icon: Trophy,
    imageAlign: "right",
    empty: "No Game of the Month this round.",
  },
  nr_gotm: {
    title: "Non-RPG Game of the Month",
    label: "Non RPG Game of the Month",
    compactLabel: "NR GOTM",
    accent: "purple",
    Icon: Gamepad2,
    imageAlign: "left",
    empty: "No Non-RPG Game of the Month this round.",
  },
} as const;

const gridClass: Record<number, string> = {
  1: "",
  2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  3: "grid grid-cols-1 sm:grid-cols-3 gap-4",
};

// Entries carry no title of their own; it comes from the linked game.
const UNKNOWN_GAME_TITLE = "Unknown game";

export function GotmRoundBlock({
  kind,
  roundNumber,
  block,
  action,
}: {
  kind: VotingCategory;
  roundNumber: number;
  block: GotmRoundBlockData;
  action?: ReactNode;
}) {
  const style = KIND[kind];
  const games = [...block.games].sort((a, b) => a.game_index - b.game_index);
  const isCompact = games.length >= 3;

  return (
    <section className="space-y-3">
      <SectionHeader
        title={style.title}
        round={roundNumber}
        monthYear={block.month_year}
        pickCount={games.length}
        accent={style.accent}
        Icon={style.Icon}
        action={action}
      />
      {games.length === 0 ? (
        // A block of only NR-GOTM "N/A" placeholders.
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {style.empty}
        </p>
      ) : (
        <div className={gridClass[games.length] ?? gridClass[3]}>
          {games.map((game, i) => {
            const cardProps = gotmCardProps(game.game ?? null, UNKNOWN_GAME_TITLE);
            return (
              <GotmCard
                key={game.gamedb_game_id ?? `index-${i}`}
                label={isCompact ? style.compactLabel : style.label}
                round={roundNumber}
                monthYear={block.month_year}
                accent={style.accent}
                compact={isCompact}
                showMeta={false}
                imageAlign={style.imageAlign}
                href={
                  game.gamedb_game_id
                    ? `/games/${game.gamedb_game_id}`
                    : undefined
                }
                links={gotmLinks({
                  redditUrl: game.reddit_url,
                  threadId: game.thread_id,
                  votingResultsMessageId: block.voting_results_message_id,
                })}
                {...cardProps}
                // Several NR winners leave no room for a blurb.
                description={
                  kind === "nr_gotm" && games.length > 1
                    ? null
                    : cardProps.description
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
