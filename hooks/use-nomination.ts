"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteNominationAction,
  upsertNominationAction,
} from "@/app/actions/nominations";
import type { Game, Nomination, VotingCategory } from "@/lib/api/types";

// The viewer's nomination for one track: editing it (the game and the
// reason), saving it and withdrawing it. The backend enforces the window.
export function useNomination(
  category: VotingCategory,
  round: number,
  existing: Nomination | null,
) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const startEditing = () => {
    setSelectedGame(existing?.game ?? null);
    setReason(existing?.reason ?? "");
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) {
      setError("Pick a game to nominate.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await upsertNominationAction(category, round, selectedGame.game_id, reason);
      if (!result.ok) {
        setError(result.error ?? "Failed to save nomination.");
        return;
      }
      setEditing(false);
      setSelectedGame(null);
      setReason("");
      router.refresh();
    });
  };

  const withdraw = () => {
    if (!confirm("Withdraw your nomination? Any votes it received are removed too.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteNominationAction(category, round);
      if (!result.ok) {
        setError(result.error ?? "Failed to withdraw nomination.");
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  return {
    editing,
    selectedGame,
    setSelectedGame,
    reason,
    setReason,
    error,
    pending,
    startEditing,
    cancel,
    submit,
    withdraw,
  };
}

export type NominationState = ReturnType<typeof useNomination>;
