"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Crown, X } from "lucide-react";
import { castVoteAction } from "@/app/actions/votes";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
} from "@/lib/api/types";
import { discordAvatarUrl } from "@/lib/auth-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { accentClasses, BAR_MOTION, type AccentStyle } from "./accents";
import { OwnNominationCard } from "./own-nomination-card";



// The viewer's own votes, plus the per-nomination counts they affect.
interface TallyState {
  counts: Map<number, number>;
  votes: { nominationId: number; gameId: number; votedAt: string }[];
}

export interface NominationBoardProps {
  category: VotingCategory;
  round: number;
  accent: keyof typeof accentClasses;
  nominations: Nomination[];
  tally: VoteTallyRow[];
  // Per-user vote cap for the round (2, or 3 for fields of 9+ nominations).
  cap: number;
  // The signed-in member's own votes for the round.
  userVotes: NominationVote[];
  votingOpen: boolean;
  votingEnded: boolean;
  emptyMessage?: string;
  // The signed-in member, so their own nomination can be marked. The board
  // otherwise only knows about votes, not who nominated what.
  viewerId?: string;
}

export function NominationBoard({
  category,
  round,
  accent,
  nominations,
  tally,
  cap,
  userVotes,
  votingOpen,
  votingEnded,
  emptyMessage = "No nominations yet.",
  viewerId,
}: NominationBoardProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const accentStyle = accentClasses[accent];
  const showCounts = votingOpen || votingEnded;

  // The server state the optimistic layer builds on. Votes are kept oldest
  // first so the cap eviction below can mirror the backend's choice.
  const serverState = useMemo<TallyState>(() => {
    const votes = userVotes
      .filter((vote) => vote.gamedb_game_id !== null)
      .map((vote) => ({
        nominationId: vote.nomination_id,
        gameId: vote.gamedb_game_id as number,
        votedAt: vote.voted_at,
      }))
      .sort((a, b) => a.votedAt.localeCompare(b.votedAt));
    return {
      counts: new Map(tally.map((row) => [row.nomination_id, row.vote_count])),
      votes,
    };
  }, [tally, userVotes]);

  // Casting a vote round-trips the action and then a router.refresh(), so
  // without this the card sat on stale counts and the button flashed back to
  // "Vote" before the new tally landed. Applying the change locally lets the
  // bars animate from the moment of the click; refresh reconciles after.
  const [state, castOptimistic] = useOptimistic(
    serverState,
    (prev, nomination: Nomination): TallyState => {
      const gameId = nomination.gamedb_game_id;
      if (gameId === null) return prev;

      const counts = new Map(prev.counts);
      const bump = (id: number, delta: number) =>
        counts.set(id, Math.max(0, (counts.get(id) ?? 0) + delta));

      const existing = prev.votes.find((vote) => vote.gameId === gameId);
      if (existing) {
        bump(existing.nominationId, -1);
        return {
          counts,
          votes: prev.votes.filter((vote) => vote.gameId !== gameId),
        };
      }

      bump(nomination.nomination_id, 1);
      let votes = [
        ...prev.votes,
        {
          nominationId: nomination.nomination_id,
          gameId,
          votedAt: new Date().toISOString(),
        },
      ];
      // Mirrors the backend: voting past the cap evicts the oldest vote.
      while (votes.length > cap) {
        const [oldest, ...rest] = votes;
        bump(oldest.nominationId, -1);
        votes = rest;
      }
      return { counts, votes };
    },
  );

  const countByNomination = state.counts;

  // Votes are per game, not per nomination: a vote on any nomination of a
  // game marks every nomination of that game as "voted" (and voting one of
  // them toggles that vote off).
  const votedGameIds = useMemo(
    () => new Set(state.votes.map((vote) => vote.gameId)),
    [state.votes],
  );

  const ordered = useMemo(() => {
    if (!votingEnded) return nominations;
    return [...nominations].sort(
      (a, b) =>
        (countByNomination.get(b.nomination_id) ?? 0) -
        (countByNomination.get(a.nomination_id) ?? 0),
    );
  }, [nominations, votingEnded, countByNomination]);

  // Derived from the optimistic counts so every bar rescales in the same
  // frame as the one that was voted on.
  const maxCount = useMemo(
    () => Math.max(0, ...countByNomination.values()),
    [countByNomination],
  );

  const handleVote = (nomination: Nomination) => {
    setError(null);
    setPendingId(nomination.nomination_id);
    startTransition(async () => {
      castOptimistic(nomination);
      const result = await castVoteAction(
        category,
        round,
        nomination.nomination_id,
      );
      if (!result.ok) {
        setError(result.error ?? "Failed to cast vote.");
        setPendingId(null);
        return;
      }
      router.refresh();
      setPendingId(null);
    });
  };

  if (!nominations.length) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {votingOpen && (
        <p className="text-xs text-muted-foreground">
          You&apos;ve used{" "}
          <span className={`font-semibold ${accentStyle.count}`}>
            {state.votes.length} of {cap}
          </span>{" "}
          votes. Vote again on a game to take that vote back.
        </p>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setError(null)}
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {ordered.map((nomination) => {
          const count = countByNomination.get(nomination.nomination_id) ?? 0;
          const voted =
            nomination.gamedb_game_id !== null &&
            votedGameIds.has(nomination.gamedb_game_id);
          const isWinner = votingEnded && maxCount > 0 && count === maxCount;
          const isOwn =
            viewerId !== undefined && nomination.user_id === viewerId;

          const shared = {
            nomination,
            accentStyle,
            count: showCounts ? count : null,
            maxCount,
            voted,
            votingOpen,
            disabled: pendingId === nomination.nomination_id,
            onVote: () => handleVote(nomination),
          };

          // The viewer's own nomination gets the showcase treatment; everyone
          // else's stays a compact row.
          return isOwn ? (
            <OwnNominationCard key={nomination.nomination_id} {...shared} />
          ) : (
            <NominationCard
              key={nomination.nomination_id}
              {...shared}
              isWinner={isWinner}
            />
          );
        })}
      </ul>
    </div>
  );
}

function NominationCard({
  nomination,
  accentStyle,
  count,
  maxCount,
  voted,
  isWinner,
  votingOpen,
  disabled,
  onVote,
}: {
  nomination: Nomination;
  accentStyle: AccentStyle;
  // null while counts are hidden (nomination phase).
  count: number | null;
  maxCount: number;
  voted: boolean;
  isWinner: boolean;
  votingOpen: boolean;
  disabled: boolean;
  onVote: () => void;
}) {
  const game = nomination.game;
  const title = game?.title ?? `Game #${nomination.gamedb_game_id ?? "?"}`;
  const coverUrl = game?.cover_url ?? null;
  const year = game?.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;
  const nominator = nomination.user;
  const nominatorName =
    nominator?.global_name ?? nominator?.username ?? "Unknown member";
  const gameHref = nomination.gamedb_game_id
    ? `/games/${nomination.gamedb_game_id}`
    : null;
  // Voting needs a game to attach to, so unknown-game nominations stay inert.
  const canVote = votingOpen && nomination.gamedb_game_id !== null;

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4 transition-colors",
        isWinner && accentStyle.winner,
        voted && votingOpen && accentStyle.card,
      )}
    >
      {/* A real button rather than a click handler on the <li>, so the card is
          reachable by keyboard and announces its toggle state. It covers the
          card, and the few things that need their own clicks sit above it. */}
      {canVote && (
        <button
          type="button"
          onClick={onVote}
          disabled={disabled}
          aria-pressed={voted}
          aria-label={voted ? `Remove your vote for ${title}` : `Vote for ${title}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-default"
        />
      )}

      <div
        className={cn(
          "relative z-20 flex items-start gap-4",
          // Lets clicks fall through to the vote button underneath; children
          // that need their own target opt back in with pointer-events-auto.
          canVote && "pointer-events-none",
        )}
      >
        {/* Same pointer split as the title: inert on touch so the tap votes,
            a link to the game from sm up. */}
        <CardCover coverUrl={coverUrl} href={gameHref} inert={canVote} />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {isWinner && (
              <Crown className={`size-4 shrink-0 ${accentStyle.crown}`} />
            )}
            <h3 className="truncate font-semibold tracking-tight">
              {gameHref ? (
                <Link
                  href={gameHref}
                  // Pointer-inert on touch, where the title sits inside the
                  // card's vote target; the menu below is the way to the game
                  // page there. From sm up it behaves as a normal link.
                  className="pointer-events-none hover:underline sm:pointer-events-auto"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
            {/* Hidden on phones: at 360px it competed directly with the
                title, and the year is on the game page anyway. */}
            {year && (
              <span className="hidden shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-block">
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
            <span className="truncate">Nominated by {nominatorName}</span>
          </div>

          {nomination.reason && (
            <p className="text-xs italic leading-relaxed text-muted-foreground/80 line-clamp-3">
              &ldquo;{nomination.reason}&rdquo;
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 self-center">
          {/* Touch-only route to the game page. It lives in this column rather
              than beside the title so it costs the title no width. */}
          {gameHref && (
            <Link
              href={gameHref}
              aria-label={`View ${title}`}
              className="pointer-events-auto -mr-1 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden sm:hidden"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          )}
          {count !== null && (
            <p className="text-sm text-muted-foreground">
              <span
                className={`text-xl font-semibold tabular-nums ${accentStyle.count}`}
              >
                {count}
              </span>{" "}
              {count === 1 ? "vote" : "votes"}
            </p>
          )}
          {/* The vote state used to live on the button; with the whole card
              acting as the control it needs its own mark. */}
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
      </div>

      {count !== null && maxCount > 0 && (
        // Relative to the leader's tally, not an absolute target, so max is
        // the top count rather than 100.
        <Progress
          value={count}
          max={maxCount}
          aria-label={`${count} of ${maxCount} votes`}
          className={cn("relative z-20 mt-3", canVote && "pointer-events-none")}
          indicatorClassName={cn(accentStyle.bar, BAR_MOTION)}
        />
      )}
    </li>
  );
}

function CardCover({
  coverUrl,
  href,
  inert,
}: {
  coverUrl: string | null;
  href: string | null;
  inert: boolean;
}) {
  const art = coverUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverUrl}
      alt=""
      aria-hidden
      className="h-full w-full object-cover"
    />
  ) : null;

  if (!href) {
    return (
      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {art}
      </div>
    );
  }

  return (
    <Link
      href={href}
      tabIndex={-1}
      aria-hidden
      className={cn(
        "h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted",
        // The title link beside it already reaches the game page for keyboard
        // and screen-reader users, so this is a pointer shortcut only.
        inert && "pointer-events-none sm:pointer-events-auto",
      )}
    >
      {art}
    </Link>
  );
}
