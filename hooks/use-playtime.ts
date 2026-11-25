"use client";

import { useState, useTransition } from "react";

import type { PlaytimeResult } from "@/app/actions/playtime";
import type { GamePlaytime } from "@/lib/playtime/types";

/**
 * The member's Playtime for the game on the game page (spec api#457,
 * www#185): the document the page read, replaced by each write's answer and
 * by a fresh read when the page refreshes (a Game Completion logged closes
 * the Playthrough). "Keep both" on a mismatch has no API, so it is set aside
 * for this visit only.
 */
export function usePlaytime(initial: GamePlaytime | null) {
  const [state, setState] = useState({ from: initial, doc: initial });
  if (state.from !== initial) setState({ from: initial, doc: initial });
  const [keptBoth, setKeptBoth] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const doc = state.doc && {
    ...state.doc,
    mismatches: state.doc.mismatches.filter((m) => !keptBoth.has(`${m.provider}:${m.platform_id}`)),
  };

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
    keepBoth: (key: string) => setKeptBoth((prev) => new Set(prev).add(key)),
  };
}

export type PlaytimeState = ReturnType<typeof usePlaytime>;
