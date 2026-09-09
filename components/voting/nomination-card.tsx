"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Crown } from "lucide-react";
import type { Nomination } from "@/lib/api/types";
import { discordAvatarUrl } from "@/lib/auth-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CornerRibbon } from "@/components/corner-ribbon";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BAR_MOTION, type AccentStyle } from "./accents";

export interface NominationCardProps {
  nomination: Nomination;
  accentStyle: AccentStyle;
  // null while counts are hidden (nomination phase).
  count: number | null;
  maxCount: number;
  voted: boolean;
  isWinner: boolean;
  // The viewer's own nomination — marked by the corner ribbon.
  isOwn: boolean;
  votingOpen: boolean;
  disabled: boolean;
  onVote: () => void;
}

// Every nomination gets the dashboard's showcase treatment: the game's key art
// bleeding across the card behind a scrim, the category's glow washing the text
// side, and the title carrying the card. The board used to reserve this for the
// viewer's own nomination and hand everyone else a compact data row, which made
// the board look like a list with one poster stuck in it.
//
// Ownership no longer needs the scale difference to read, so it moves to the
// corner ribbon — the same device the game page uses for GOTM / NR-GOTM
// winners, in the column's own hue.
export function NominationCard({
  nomination,
  accentStyle,
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
  // Prefers the wide key art; falls back to the box cover, which is all the
  // API has for many games.
  const imageUrl = game?.art_url ?? game?.cover_url ?? null;
  const year = game?.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;
  const gameHref = nomination.gamedb_game_id
    ? `/games/${nomination.gamedb_game_id}`
    : null;
  // Voting needs a game to attach to, so unknown-game nominations stay inert.
  const canVote = votingOpen && nomination.gamedb_game_id !== null;

  const nominator = nomination.user;
  const nominatorName =
    nominator?.global_name ?? nominator?.username ?? "Unknown member";

  return (
    <li
      className={cn(
        "group/card relative min-h-40 overflow-hidden rounded-xl border bg-card transition-colors sm:min-h-48",
        accentStyle.hoverBorder,
        isWinner && accentStyle.winner,
        isOwn && accentStyle.own,
        voted && votingOpen && accentStyle.card,
      )}
    >
      {imageUrl && (
        <div className="absolute top-0 right-0 h-full w-[70%] overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_20%] transition-transform duration-500 group-hover/card:scale-105 motion-reduce:transition-none"
          />
          {/* Holds the card colour across the text half and lets the art come
              through on the outer edge. */}
          <div className="absolute inset-0 bg-linear-to-r from-card from-15% via-card/80 via-55% to-transparent" />
        </div>
      )}

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-linear-to-r",
          accentStyle.glow,
        )}
      />

      {isOwn && (
        <CornerRibbon
          accent={accentStyle.ribbon}
          label="Your pick"
          srLabel="Your nomination"
        />
      )}

      {/* A real button rather than a click handler on the <li>, so the card is
          reachable by keyboard and announces its toggle state. It covers the
          card, and the few things that need their own clicks sit above it. */}
      {canVote && (
        <button
          type="button"
          onClick={onVote}
          disabled={disabled}
          aria-pressed={voted}
          aria-label={
            voted ? `Remove your vote for ${title}` : `Vote for ${title}`
          }
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-default"
        />
      )}

      <div
        className={cn(
          "relative z-20 flex min-h-40 flex-col justify-between gap-3 p-4 sm:min-h-48 sm:p-5",
          // Lets clicks fall through to the vote button underneath; children
          // that need their own target opt back in with pointer-events-auto.
          canVote && "pointer-events-none",
        )}
      >
        {/* Kept clear of the art's outer edge, and of the ribbon when there
            is one. */}
        <div className={cn("space-y-1.5", isOwn ? "max-w-[58%]" : "max-w-[62%]")}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {isWinner && (
              <Crown className={cn("size-4 shrink-0", accentStyle.crown)} />
            )}
            <h3 className="text-lg font-bold tracking-tight break-words sm:text-xl">
              {gameHref ? (
                <Link
                  href={gameHref}
                  // Pointer-inert on touch, where the title sits inside the
                  // card's vote target; the arrow below is the way to the game
                  // page there. From sm up it behaves as a normal link.
                  className="pointer-events-none hover:underline sm:pointer-events-auto"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
            {year && (
              <span className="shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {year}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Avatar className="size-4">
              <AvatarImage
                src={
                  nominator
                    ? discordAvatarUrl(
                        nominator.user_id,
                        nominator.discord_avatar,
                        32,
                      )
                    : undefined
                }
                alt=""
              />
              <AvatarFallback className="text-[8px]">
                {nominatorName[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              Nominated by {isOwn ? "you" : nominatorName}
            </span>
          </div>

          {nomination.reason && (
            <p className="pt-0.5 text-xs italic leading-relaxed text-muted-foreground/80 line-clamp-3">
              &ldquo;{nomination.reason}&rdquo;
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          {/* The vote state used to live on a button; with the whole card
              acting as the control it needs its own mark. */}
          <div className="flex items-center gap-2">
            {votingOpen && voted && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  accentStyle.voted,
                )}
              >
                <Check className="size-3" />
                Voted
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {count !== null && (
              <p className="text-sm text-muted-foreground">
                <span
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    accentStyle.count,
                  )}
                >
                  {count}
                </span>{" "}
                {count === 1 ? "vote" : "votes"}
              </p>
            )}
            {/* Touch-only route to the game page, where the title link is
                inert because the card itself is the vote target. */}
            {gameHref && (
              <Link
                href={gameHref}
                aria-label={`View ${title}`}
                className="pointer-events-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden sm:hidden"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {count !== null && maxCount > 0 && (
        // Relative to the leader's tally, not an absolute target, so max is
        // the top count rather than 100.
        <Progress
          value={count}
          max={maxCount}
          aria-label={`${count} of ${maxCount} votes`}
          className={cn(
            "absolute inset-x-0 bottom-0 z-20",
            canVote && "pointer-events-none",
          )}
          indicatorClassName={cn(accentStyle.bar, BAR_MOTION)}
        />
      )}
    </li>
  );
}
