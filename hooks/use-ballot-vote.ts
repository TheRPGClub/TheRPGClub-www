"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { castVoteAction } from "@/app/actions/votes";
import type { VotingCategory } from "@/lib/api/types";

// A game page's ballot vote: one toggle on one nomination, applied the
// moment it is cast. Same reason the board carries one: the action
// round-trips and then refreshes, so without it the count and the button sit
// stale until the new tally lands.
export function useBallotVote({
  category,
  round,
  nominationId,
  count,
  voted,
  votesUsed,
  cap,
}: {
  category: VotingCategory;
  round: number;
  nominationId: number;
  count: number;
  voted: boolean;
  votesUsed: number;
  cap: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [state, toggleOptimistic] = useOptimistic(
    { count, voted, used: votesUsed },
    (prev) =>
      prev.voted
        ? {
            count: Math.max(0, prev.count - 1),
            voted: false,
            used: Math.max(0, prev.used - 1),
          }
        : {
            count: prev.count + 1,
            voted: true,
            // At the cap the backend evicts the oldest vote instead of
            // refusing, so the spend stays put and some other game loses one.
            used: Math.min(cap, prev.used + 1),
          },
  );

  const vote = () => {
    setError(null);
    startTransition(async () => {
      toggleOptimistic(null);
      const result = await castVoteAction(category, round, nominationId);
      if (!result.ok) {
        setError(result.error ?? "Failed to cast vote.");
        return;
      }
      router.refresh();
    });
  };

  return { ...state, pending, error, clearError: () => setError(null), vote };
}
