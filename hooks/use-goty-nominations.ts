"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nominateGotyAction, replaceGotyAction, withdrawGotyAction } from "@/app/actions/goty";
import type { GotyNomination } from "@/lib/goty/types";

// The viewer's Game of the Year nominations on /goty: the game picked in
// the search, the nomination being swapped ("Edit"), and the actions, each
// followed by a refresh so the hand and the wall show the API's answer.
export function useGotyNominations(year: number) {
  const router = useRouter();
  const [picked, setPicked] = useState<{ game_id: number; title: string } | null>(null);
  const [replacing, setReplacing] = useState<GotyNomination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (work: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        setError(result.error ?? "That didn't save. Try again.");
        return;
      }
      setPicked(null);
      setReplacing(null);
      router.refresh();
    });
  };

  const submit = () => {
    if (!picked) return;
    const target = replacing;
    run(() =>
      target
        ? replaceGotyAction(year, target.id, target.gamedb_game_id, picked.game_id)
        : nominateGotyAction(year, picked.game_id),
    );
  };

  return {
    picked,
    replacing,
    error,
    pending,
    pick: (game: { game_id: number; title: string } | null) => {
      setError(null);
      setPicked((prev) => (prev?.game_id === game?.game_id ? null : game));
    },
    startReplacing: (n: GotyNomination) => {
      setError(null);
      setReplacing(n);
    },
    cancel: () => {
      setPicked(null);
      setReplacing(null);
      setError(null);
    },
    submit,
    withdraw: (n: GotyNomination) => run(() => withdrawGotyAction(year, n.id)),
  };
}

export type GotyNominationsState = ReturnType<typeof useGotyNominations>;
