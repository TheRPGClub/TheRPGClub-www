"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { savePinnedPagesAction } from "@/app/actions/pinned-pages";
import { movePin, pinsFull, placePin, togglePin, type PinRules } from "@/lib/pinned-pages";

const NOTICE_MS = 6000;

// The sidebar's pin, unpin and reorder. The list changes at once (an optimistic
// change over the session's own list) and the whole visible list is saved.
// The action refreshes the router, so `initial` is the API's fresh list once
// a save lands; a failed save springs back to it and raises `failed` (with
// the API's reason when it refused the list) for a few seconds. `rules` are
// the session's room and limit (lib/pinned-pages).
export function usePinnedPages(initial: readonly string[], rules: PinRules) {
  const [keys, setKeys] = useOptimistic(initial, (_state, next: readonly string[]) => next);
  // null while the last save didn't fail.
  const [failure, setFailure] = useState<{ reason: string | null } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!failure) return;
    const timer = setTimeout(() => setFailure(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [failure]);

  // Show `next` at once and save it; null (nothing to change) does nothing.
  function save(next: string[] | null) {
    if (!next) return;
    setFailure(null);
    startTransition(async () => {
      setKeys(next);
      let result: { ok: boolean; reason?: string } = { ok: false };
      try {
        result = await savePinnedPagesAction(next);
      } catch {
        result = { ok: false };
      }
      if (!result.ok) setFailure({ reason: result.reason ?? null });
    });
  }

  return {
    keys,
    rules,
    full: pinsFull(keys, rules),
    failed: failure !== null,
    reason: failure?.reason ?? null,
    dismiss: () => setFailure(null),
    // Full: the control says so and nothing is dropped.
    toggle: (key: string) => save(togglePin(keys, key, rules)),
    move: (key: string, by: -1 | 1) => save(movePin(keys, key, by)),
    place: (key: string, before: string | null) => save(placePin(keys, key, before)),
  };
}
