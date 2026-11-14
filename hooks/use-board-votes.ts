"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { castVoteAction } from "@/app/actions/votes";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
} from "@/lib/api/types";
import { castOnTally, tallyState } from "@/lib/voting/tally";

// The nomination board's votes: the tally and the viewer's own votes, with a
// vote applied the moment it is cast.
//
// Casting a vote round-trips the action and then a router.refresh(), so
// without the optimistic layer the card sat on stale counts and the button
// flashed back to "Vote" before the new tally landed. Applying the change
// locally lets the bars animate from the moment of the click; refresh
// reconciles after.
export function useBoardVotes({
  category,
  round,
  tally,
  userVotes,
  cap,
}: {
  category: VotingCategory;
  round: number;
  tally: VoteTallyRow[];
  userVotes: NominationVote[];
  cap: number;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const serverState = useMemo(() => tallyState(tally, userVotes), [tally, userVotes]);
  const [state, castOptimistic] = useOptimistic(
    serverState,
    (prev, nomination: Nomination) =>
      castOnTally(prev, nomination, cap, new Date().toISOString()),
  );

  // Votes are per game, not per nomination: a vote on any nomination of a
  // game marks every nomination of that game as "voted" (and voting one of
  // them toggles that vote off).
  const votedGameIds = useMemo(
    () => new Set(state.votes.map((vote) => vote.gameId)),
    [state.votes],
  );

  // Derived from the optimistic counts so every bar rescales in the same
  // frame as the one that was voted on.
  const maxCount = useMemo(() => Math.max(0, ...state.counts.values()), [state.counts]);

  const vote = (nomination: Nomination) => {
    setError(null);
    setPendingId(nomination.nomination_id);
    startTransition(async () => {
      castOptimistic(nomination);
      const result = await castVoteAction(category, round, nomination.nomination_id);
      if (!result.ok) {
        setError(result.error ?? "Failed to cast vote.");
        setPendingId(null);
        return;
      }
      router.refresh();
      setPendingId(null);
    });
  };

  return {
    counts: state.counts,
    votesUsed: state.votes.length,
    votedGameIds,
    maxCount,
    pendingId,
    error,
    clearError: () => setError(null),
    vote,
  };
}
