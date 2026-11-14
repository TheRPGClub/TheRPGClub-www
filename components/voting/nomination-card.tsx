"use client";

import Link from "next/link";
import { Check, Loader2, Vote } from "lucide-react";
import type { Nomination, VotingCategory } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { NominationCover } from "./nomination-cover";
import { NominationCredit } from "./nomination-credit";
import { NominationTally } from "./nomination-tally";

// One nomination on the board, as a cover tile: the box art footed in the
// track's ink, the nominator and their reason under it. While the vote is
// open each tile carries its own vote toggle; once counts are public the
// tally sits under the cover, scaled to the leader.

const VOTE_BUTTON = { gotm: "default", nr_gotm: "nr" } as const;

export interface NominationCardProps {
  category: VotingCategory;
  nomination: Nomination;
  // null while counts are hidden (nomination phase).
  count: number | null;
  maxCount: number;
  voted: boolean;
  // Top of the tally once the vote has ended.
  isWinner: boolean;
  // The viewer's own nomination.
  isOwn: boolean;
  votingOpen: boolean;
  disabled: boolean;
  onVote: () => void;
}

export function NominationCard({
  category,
  nomination,
  count,
  maxCount,
  voted,
  isWinner,
  isOwn,
  votingOpen,
  disabled,
  onVote,
}: NominationCardProps) {
  const game = nomination.game;
  const title = game?.title ?? `Game #${nomination.gamedb_game_id ?? "?"}`;
  const gameHref = nomination.gamedb_game_id ? `/games/${nomination.gamedb_game_id}` : null;
  // Voting needs a game to attach to, so unknown-game nominations stay inert.
  const canVote = votingOpen && nomination.gamedb_game_id !== null;

  const cover = (
    <NominationCover
      category={category}
      title={title}
      cover={game?.cover_url ?? game?.art_url ?? null}
      isOwn={isOwn}
      isWinner={isWinner}
      showVoted={votingOpen && voted}
    />
  );

  return (
    <li className="group/tile flex min-w-0 flex-col gap-2">
      {gameHref ? (
        <Link href={gameHref} tabIndex={-1} aria-hidden>
          {cover}
        </Link>
      ) : (
        cover
      )}

      <h3 className="font-headline text-[1.45rem] leading-[0.95] text-balance">
        {gameHref ? (
          <Link href={gameHref} className="transition-colors hover:text-highlight">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      <NominationCredit nominator={nomination.user} isOwn={isOwn} />

      {nomination.reason && (
        <p className="line-clamp-3 text-[0.82rem] leading-[1.45] text-dim-foreground">
          &ldquo;{nomination.reason}&rdquo;
        </p>
      )}

      {(count !== null || canVote) && (
        <div className="mt-auto space-y-2 pt-1">
          {count !== null && (
            <NominationTally category={category} count={count} maxCount={maxCount} />
          )}
          {canVote && (
            <Button
              type="button"
              variant={voted ? "outline" : VOTE_BUTTON[category]}
              onClick={onVote}
              disabled={disabled}
              aria-pressed={voted}
              aria-label={voted ? `Remove your vote for ${title}` : `Vote for ${title}`}
              className="w-full"
            >
              {disabled ? (
                <Loader2 aria-hidden className="motion-safe:animate-spin" />
              ) : voted ? (
                <Check aria-hidden data-icon="inline-start" />
              ) : (
                <Vote aria-hidden data-icon="inline-start" />
              )}
              {voted ? "Voted" : "Vote"}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
