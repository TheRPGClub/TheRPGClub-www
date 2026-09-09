"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Nomination } from "@/lib/api/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BAR_MOTION, type AccentStyle } from "./accents";

export interface OwnNominationCardProps {
  nomination: Nomination;
  accentStyle: AccentStyle;
  // null while counts are hidden (nomination phase).
  count: number | null;
  maxCount: number;
  voted: boolean;
  votingOpen: boolean;
  disabled: boolean;
  onVote: () => void;
}

// The viewer's own nomination, given the showcase treatment the dashboard uses
// for GOTM winners: the game's key art bleeding across the card behind a
// scrim, at roughly double the height of a compact row. Scale is the whole
// point — it's the one card in the list that isn't a data row.
export function OwnNominationCard({
  nomination,
  accentStyle,
  count,
  maxCount,
  voted,
  votingOpen,
  disabled,
  onVote,
}: OwnNominationCardProps) {
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
  const canVote = votingOpen && nomination.gamedb_game_id !== null;

  return (
    <li
      // Red border marks ownership in both categories; the voted state is
      // carried by the pill, since a tint over the art would barely register.
      className="group/own relative overflow-hidden rounded-xl border border-brand-500/40 bg-card"
    >
      {imageUrl && (
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover object-[center_25%] transition-transform duration-500 group-hover/own:scale-105 motion-reduce:transition-none"
          />
          {/* Keeps the text side legible over whatever the art happens to be. */}
          <div className="absolute inset-0 bg-linear-to-r from-card from-30% via-card/85 via-70% to-card/25" />
        </div>
      )}

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
          "relative z-20 flex min-h-48 flex-col justify-between gap-4 p-5 sm:min-h-56",
          canVote && "pointer-events-none",
        )}
      >
        <div className="max-w-[70%] space-y-1.5 sm:max-w-[62%]">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
              {gameHref ? (
                <Link
                  href={gameHref}
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

          {/* Ownership reads as a byline, in the slot the compact rows use for
              "Nominated by <name>" — not as a label above the title. */}
          <p className="text-xs text-muted-foreground">Your nomination</p>

          {nomination.reason && (
            <p className="pt-1 text-sm italic leading-relaxed text-muted-foreground/90 line-clamp-3">
              &ldquo;{nomination.reason}&rdquo;
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
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
