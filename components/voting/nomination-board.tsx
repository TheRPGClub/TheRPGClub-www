"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown, Loader2, X } from "lucide-react";
import { castVoteAction } from "@/app/actions/votes";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
} from "@/lib/api/types";
import { discordAvatarUrl } from "@/lib/auth-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const accentClasses = {
  emerald: {
    count: "text-emerald-200/90",
    bar: "bg-emerald-500/50",
    voted:
      "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
    winner: "border-emerald-500/50",
    crown: "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  },
  purple: {
    count: "text-purple-200/90",
    bar: "bg-purple-500/50",
    voted:
      "border-purple-500/50 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25",
    winner: "border-purple-500/50",
    crown: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  },
} as const;

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
}: NominationBoardProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const accentStyle = accentClasses[accent];
  const showCounts = votingOpen || votingEnded;

  const countByNomination = useMemo(
    () => new Map(tally.map((row) => [row.nomination_id, row.vote_count])),
    [tally],
  );

  // Votes are per game, not per nomination: a vote on any nomination of a
  // game marks every nomination of that game as "voted" (and voting one of
  // them toggles that vote off).
  const votedGameIds = useMemo(
    () =>
      new Set(
        userVotes
          .map((vote) => vote.gamedb_game_id)
          .filter((id): id is number => id !== null),
      ),
    [userVotes],
  );

  const ordered = useMemo(() => {
    if (!votingEnded) return nominations;
    return [...nominations].sort(
      (a, b) =>
        (countByNomination.get(b.nomination_id) ?? 0) -
        (countByNomination.get(a.nomination_id) ?? 0),
    );
  }, [nominations, votingEnded, countByNomination]);

  const maxCount = useMemo(
    () => Math.max(0, ...tally.map((row) => row.vote_count)),
    [tally],
  );

  const handleVote = (nomination: Nomination) => {
    setError(null);
    setNotice(null);
    setPendingId(nomination.nomination_id);
    startTransition(async () => {
      const result = await castVoteAction(
        category,
        round,
        nomination.nomination_id,
      );
      setPendingId(null);
      if (!result.ok) {
        setError(result.error ?? "Failed to cast vote.");
        return;
      }
      if (result.data?.warning) setNotice(result.data.warning);
      router.refresh();
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
            {userVotes.length} of {cap}
          </span>{" "}
          votes. Vote again on a game to take that vote back.
        </p>
      )}

      {(notice || error) && (
        <div
          className={cn(
            "flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
            error
              ? "border-destructive/40 text-destructive"
              : "border-border text-muted-foreground",
          )}
        >
          <p>{error ?? notice}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              setError(null);
              setNotice(null);
            }}
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

          return (
            <NominationCard
              key={nomination.nomination_id}
              nomination={nomination}
              accentStyle={accentStyle}
              count={showCounts ? count : null}
              maxCount={maxCount}
              voted={voted}
              isWinner={isWinner}
              votingOpen={votingOpen}
              pending={pendingId === nomination.nomination_id}
              disabled={pendingId !== null}
              onVote={() => handleVote(nomination)}
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
  pending,
  disabled,
  onVote,
}: {
  nomination: Nomination;
  accentStyle: (typeof accentClasses)[keyof typeof accentClasses];
  // null while counts are hidden (nomination phase).
  count: number | null;
  maxCount: number;
  voted: boolean;
  isWinner: boolean;
  votingOpen: boolean;
  pending: boolean;
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

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4",
        isWinner && accentStyle.winner,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              aria-hidden
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {isWinner && (
              <Crown className={`size-4 shrink-0 ${accentStyle.crown}`} />
            )}
            <h3 className="truncate font-semibold tracking-tight">
              {nomination.gamedb_game_id ? (
                <Link
                  href={`/games/${nomination.gamedb_game_id}`}
                  className="hover:underline"
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
            <span className="truncate">Nominated by {nominatorName}</span>
          </div>

          {nomination.reason && (
            <p className="text-xs italic leading-relaxed text-muted-foreground/80 line-clamp-3">
              &ldquo;{nomination.reason}&rdquo;
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 self-center">
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
          {votingOpen && (
            <Button
              size="sm"
              variant="outline"
              onClick={onVote}
              disabled={disabled || nomination.gamedb_game_id === null}
              className={cn(voted && accentStyle.voted)}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : voted ? (
                <>
                  <Check className="size-3.5" />
                  Voted
                </>
              ) : (
                "Vote"
              )}
            </Button>
          )}
        </div>
      </div>

      {count !== null && maxCount > 0 && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full rounded-full ${accentStyle.bar}`}
            style={{ width: `${(count / maxCount) * 100}%` }}
          />
        </div>
      )}
    </li>
  );
}
