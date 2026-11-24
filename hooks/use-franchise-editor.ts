"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  linkFranchiseGameAction,
  undoFranchiseChangeAction,
  unlinkFranchiseGameAction,
  type FranchiseResult,
} from "@/app/actions/franchises";
import type { FranchiseGame } from "@/lib/franchises/types";

// The Franchise page's editor (design pick 6B): every press saves at once
// and lands in the history, then the page reads itself again. A game
// unlinked while editing stays in its place, greyed, with a way to link it
// back, until editing ends.
export function useFranchiseEditor(franchiseId: number) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [unlinked, setUnlinked] = useState<FranchiseGame[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(key: string, action: () => Promise<FranchiseResult>, after?: () => void) {
    if (pending) return;
    setBusy(key);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        after?.();
        router.refresh();
      } else {
        setError(result.error);
      }
      setBusy(null);
    });
  }

  return {
    editing,
    unlinked,
    error,
    pending,
    // The key of the control whose save is running.
    busy,
    dismissError: () => setError(null),
    setEditing: (next: boolean) => {
      setEditing(next);
      if (!next) setUnlinked([]);
      setError(null);
    },
    setMainline: (game: FranchiseGame, mainline: boolean) =>
      run(`star:${game.game_id}`, () => linkFranchiseGameAction(franchiseId, game.game_id, mainline)),
    // An Add-on (`keep` false) just goes; its Undo is in the history.
    unlink: (game: FranchiseGame, keep = true) =>
      run(`x:${game.game_id}`, () => unlinkFranchiseGameAction(franchiseId, game.game_id), () => {
        if (keep) setUnlinked((prev) => [...prev.filter((g) => g.game_id !== game.game_id), game]);
      }),
    relink: (game: FranchiseGame) =>
      run(`x:${game.game_id}`, () => linkFranchiseGameAction(franchiseId, game.game_id, game.mainline || undefined), () =>
        setUnlinked((prev) => prev.filter((g) => g.game_id !== game.game_id)),
      ),
    link: (gameId: number, mainline: boolean) =>
      run(`link:${gameId}`, () => linkFranchiseGameAction(franchiseId, gameId, mainline || undefined), () =>
        setUnlinked((prev) => prev.filter((g) => g.game_id !== gameId)),
      ),
    undo: (changeId: number) => run(`undo:${changeId}`, () => undoFranchiseChangeAction(franchiseId, changeId)),
  };
}

export type FranchiseEditor = ReturnType<typeof useFranchiseEditor>;
