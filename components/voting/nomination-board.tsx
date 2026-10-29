"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { castVoteAction } from "@/app/actions/votes";
import { cn } from "@/lib/utils";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
} from "@/lib/api/types";
import { NominationCard } from "./nomination-card";

// The viewer's own votes, plus the per-nomination counts they affect.
interface TallyState {
  counts: Map<number, number>;
  votes: { nominationId: number; gameId: number; votedAt: string }[];
}

export interface NominationBoardProps {
  category: VotingCategory;
  round: number;
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
      <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {votingOpen && (
        <p className="font-label text-[0.9rem] font-bold tracking-[0.04em] text-paper-dim">
          You&apos;ve used{" "}
          <span
            className={cn(
              "font-extrabold",
              category === "gotm" ? "text-gotm-soft" : "text-nr-soft",
            )}
          >
            {state.votes.length} of {cap}
          </span>{" "}
          votes. Vote again on a game to take that vote back.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-sm border border-destructive/50 px-3 py-2 text-sm text-destructive"
        >
          <p>{error}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setError(null)}
            className="mt-0.5 shrink-0 text-paper-mute transition-colors hover:text-paper"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-4.5">
        {ordered.map((nomination) => {
          const count = countByNomination.get(nomination.nomination_id) ?? 0;
          const voted =
            nomination.gamedb_game_id !== null &&
            votedGameIds.has(nomination.gamedb_game_id);
          const isWinner = votingEnded && maxCount > 0 && count === maxCount;
          const isOwn =
            viewerId !== undefined && nomination.user_id === viewerId;

          return (
            <NominationCard
              key={nomination.nomination_id}
              category={category}
              nomination={nomination}
              count={showCounts ? count : null}
              maxCount={maxCount}
              voted={voted}
              isWinner={isWinner}
              isOwn={isOwn}
              votingOpen={votingOpen}
              disabled={pendingId === nomination.nomination_id}
              onVote={() => handleVote(nomination)}
            />
          );
        })}
      </ul>
    </div>
  );
}
