"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { castGotyVoteAction } from "@/app/actions/goty";
import { castLocally, syncFromServer } from "@/lib/goty/cast";
import type { GotyAwardKey } from "@/lib/goty/types";

export interface DroppedVote {
  dropped: number;
  added: number;
}

// The viewer's votes on one Award's ballot (or its runoff), applied at once
// and reconciled with the API's answer: the result's removed votes name the
// one dropped at the cap, and a refusal puts the votes back. One vote is in
// flight at a time (`busy` disables the Award's Vote buttons), so a refusal
// restores exactly the list before it and the dropped-vote reconcile reads
// the right one.
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
  const [local, setLocal] = useState({ votes: initial, synced: initial.join(",") });
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<DroppedVote | null>(null);
  const [, startTransition] = useTransition();
  // Guards a second click landing before React re-renders with `pending`.
  const inFlight = useRef(false);
  const synced = syncFromServer(local, initial, pending !== null);
  if (synced) setLocal(synced);
  const votes = local.votes;
  const setVotes = (next: number[]) => setLocal((s) => ({ ...s, votes: next }));

  const vote = (gameId: number) => {
    if (inFlight.current) return;
    inFlight.current = true;
    const before = votes;
    setVotes(castLocally(votes, gameId, cap).votes);
    setError(null);
    setNotice(null);
    setPending(gameId);
    startTransition(async () => {
      const result = await castGotyVoteAction(year, award, gameId);
      inFlight.current = false;
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
    busy: pending !== null,
    error,
    notice,
    vote,
    clearError: () => setError(null),
    clearNotice: () => setNotice(null),
  };
}

// Tells the Award stage the ballot's votes whenever they change, so its
// envelope reads the same count as the ballot.
export function useReportVotes(votes: number[], report: (votes: number[]) => void) {
  const latest = useRef(report);
  useEffect(() => {
    latest.current = report;
  });
  const key = votes.join(",");
  useEffect(() => {
    latest.current(key ? key.split(",").map(Number) : []);
  }, [key]);
}
