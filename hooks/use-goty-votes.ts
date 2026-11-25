"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { castGotyVoteAction } from "@/app/actions/goty";
import { castLocally } from "@/lib/goty/cast";
import type { GotyAwardKey } from "@/lib/goty/types";

export interface DroppedVote {
  dropped: number;
  added: number;
}

// The viewer's votes on one Award's ballot (or its runoff), applied at once
// and reconciled with the API's answer: the result's removed votes name the
// one dropped at the cap, and a refusal puts the votes back.
export function useGotyVotes({
  year,
  award,
  initial,
  cap,
}: {
  year: number;
  award: GotyAwardKey;
  initial: number[];
  cap: number;
}) {
  const router = useRouter();
  const [votes, setVotes] = useState<number[]>(initial);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<DroppedVote | null>(null);
  const [, startTransition] = useTransition();
  // A refresh brings the API's own list: take it once nothing is in flight.
  const [synced, setSynced] = useState(initial.join(","));
  if (pending === null && initial.join(",") !== synced) {
    setSynced(initial.join(","));
    setVotes(initial);
  }

  const vote = (gameId: number) => {
    const before = votes;
    const local = castLocally(votes, gameId, cap);
    setVotes(local.votes);
    setError(null);
    setNotice(null);
    setPending(gameId);
    startTransition(async () => {
      const result = await castGotyVoteAction(year, award, gameId);
      setPending(null);
      if (!result.ok || !result.data) {
        setVotes(before);
        setError(result.error ?? "Your vote didn't land. Try again.");
        return;
      }
      const removed = result.data.removed_votes.map((v) => v.gamedb_game_id);
      if (result.data.action === "voted" && removed.length > 0) {
        setVotes([...before.filter((v) => !removed.includes(v)), gameId]);
        setNotice({ dropped: removed[0], added: gameId });
      }
      router.refresh();
    });
  };

  return {
    votes,
    pending,
    error,
    notice,
    vote,
    clearError: () => setError(null),
    clearNotice: () => setNotice(null),
  };
}
