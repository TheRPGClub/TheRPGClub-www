"use client";

import Link from "next/link";
import { Check, Loader2, Vote } from "lucide-react";
import type { Nomination, VotingCategory } from "@/lib/api/types";
import { discordAvatarUrl } from "@/lib/auth-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BAR_MOTION } from "./accents";

// One nomination on the board, as a cover tile: the box art footed in the
// track's ink (GOTM red, NR-GOTM violet), the nominator and their reason
// under it. The viewer's own nomination wears the nominations yellow. While
// the vote is open each tile carries its own vote toggle; once counts are
// public the tally sits under the cover, scaled to the leader.

const TRACK = {
  gotm: {
    bar: "after:bg-gotm",
    fill: "bg-gotm",
    voted: "ring-gotm",
    chip: "bg-gotm text-white",
    button: "default",
  },
  nr_gotm: {
    bar: "after:bg-nr",
    fill: "bg-nr",
    voted: "ring-nr",
    chip: "bg-nr text-white",
    button: "nr",
  },
} as const;

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
  const track = TRACK[category];
  const game = nomination.game;
  const title = game?.title ?? `Game #${nomination.gamedb_game_id ?? "?"}`;
  const cover = game?.cover_url ?? game?.art_url ?? null;
  const gameHref = nomination.gamedb_game_id
    ? `/games/${nomination.gamedb_game_id}`
    : null;
  // Voting needs a game to attach to, so unknown-game nominations stay inert.
  const canVote = votingOpen && nomination.gamedb_game_id !== null;
  const showVoted = votingOpen && voted;

  const nominator = nomination.user;
  const nominatorName =
    nominator?.global_name ?? nominator?.username ?? "Unknown member";

  const coverBlock = (
    <span
      className={cn(
        "relative block aspect-[3/4] overflow-hidden rounded-sm bg-ink-3 after:absolute after:inset-x-0 after:bottom-0 after:h-1",
        track.bar,
        isOwn && "ring-3 ring-highlight",
        showVoted && !isOwn && cn("ring-3", track.voted),
      )}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/tile:scale-[1.04]"
        />
      ) : (
        <span className="font-headline grid size-full place-items-center p-3 text-center text-2xl leading-[0.95] text-balance text-paper-mute">
          {title}
        </span>
      )}
      <span className="absolute top-2 left-2 flex flex-col items-start gap-1">
        {isOwn && (
          <span className={chipClass("bg-highlight text-ink")}>Your pick</span>
        )}
        {isWinner && (
          <span className={chipClass(track.chip)}>Most votes</span>
        )}
      </span>
      {showVoted && (
        <span
          className={cn(
            chipClass(track.chip),
            "absolute top-2 right-2 inline-flex items-center gap-1",
          )}
        >
          <Check aria-hidden className="size-3" />
          Voted
        </span>
      )}
    </span>
  );

  return (
    <li className="group/tile flex min-w-0 flex-col gap-2">
      {gameHref ? (
        <Link href={gameHref} tabIndex={-1} aria-hidden>
          {coverBlock}
        </Link>
      ) : (
        coverBlock
      )}

      <h3 className="font-headline text-[1.45rem] leading-[0.95] text-balance">
        {gameHref ? (
          <Link
            href={gameHref}
            className="transition-colors hover:text-highlight"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      <p className="font-label flex min-w-0 items-center gap-1.75 text-[0.82rem] font-bold tracking-[0.06em] text-paper-mute">
        <Avatar className="size-5 after:hidden">
          <AvatarImage
            src={
              nominator
                ? discordAvatarUrl(
                    nominator.user_id,
                    nominator.discord_avatar ?? null,
                    32,
                  )
                : undefined
            }
            alt=""
          />
          <AvatarFallback className="font-label bg-ink-3 text-[0.65rem] text-paper-dim">
            {nominatorName[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">
          <span className="sr-only">Nominated by </span>
          {isOwn ? "You" : nominatorName}
        </span>
      </p>

      {nomination.reason && (
        <p className="line-clamp-3 text-[0.82rem] leading-[1.45] text-paper-dim">
          &ldquo;{nomination.reason}&rdquo;
        </p>
      )}

      {(count !== null || canVote) && (
        <div className="mt-auto space-y-2 pt-1">
          {count !== null && (
            <div>
              <p className="font-label flex items-baseline gap-1.5 text-[0.82rem] font-bold tracking-[0.06em] text-paper-mute">
                <span className="font-headline text-[1.6rem] leading-none text-paper tabular-nums">
                  {count}
                </span>
                {count === 1 ? "vote" : "votes"}
              </p>
              {maxCount > 0 && (
                // Relative to the leader's tally, not an absolute target.
                <span
                  aria-hidden
                  className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink-3"
                >
                  <span
                    className={cn("block h-full", track.fill, BAR_MOTION)}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </span>
              )}
            </div>
          )}
          {canVote && (
            <Button
              type="button"
              variant={voted ? "outline" : track.button}
              onClick={onVote}
              disabled={disabled}
              aria-pressed={voted}
              aria-label={
                voted ? `Remove your vote for ${title}` : `Vote for ${title}`
              }
              className="w-full"
            >
              {disabled ? (
                <Loader2 aria-hidden className="animate-spin" />
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

function chipClass(tone: string): string {
  return cn(
    "font-label rounded-xs px-1.75 py-0.5 text-[0.72rem] leading-none font-extrabold tracking-[0.1em]",
    tone,
  );
}
