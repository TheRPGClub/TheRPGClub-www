"use client";

import { useState, useTransition } from "react";

import type { PlaytimeResult } from "@/app/actions/playtime";
import type { GamePlaytime } from "@/lib/playtime/types";

/**
 * The member's Playtime for the game on the game page (spec api#457,
 * www#185): the document the page read, replaced by each write's answer and
 * by a fresh read when the page refreshes (a Game Completion logged closes
 * the Playthrough).
 */
export function usePlaytime(initial: GamePlaytime | null) {
  const [state, setState] = useState({ from: initial, doc: initial });
  if (state.from !== initial) setState({ from: initial, doc: initial });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const doc = state.doc;

  // Send one write; its answer becomes the document. `then` runs once it
  // went through (close a form).
  const run = (write: () => Promise<PlaytimeResult>, then?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await write().catch(() => null);
      if (!result) return setError("Couldn't reach the club's server. Try again.");
      if (!result.ok || !result.data) return setError(result.error ?? "Couldn't save it.");
      const next = result.data;
      setState((prev) => ({ ...prev, doc: next }));
      then?.();
    });
  };

  return {
    doc,
    pending,
    error,
    clearError: () => setError(null),
    run,
  };
}

export type PlaytimeState = ReturnType<typeof usePlaytime>;
