"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { savePinnedPagesAction } from "@/app/actions/pinned-pages";
import { movePin, pinsFull, placePin, togglePin } from "@/lib/pinned-pages";

const NOTICE_MS = 6000;

// The sidebar's pin, unpin and reorder. The list changes at once (an optimistic
// change over the session's own list) and the whole visible list is saved.
// The action refreshes the router, so `initial` is the API's fresh list once
// a save lands; a failed save springs back to it and raises `failed` for a
// few seconds.
export function usePinnedPages(initial: readonly string[]) {
  const [keys, setKeys] = useOptimistic(initial, (_state, next: readonly string[]) => next);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!failed) return;
    const timer = setTimeout(() => setFailed(false), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [failed]);

  // Show `next` at once and save it; null (nothing to change) does nothing.
  function save(next: string[] | null) {
    if (!next) return;
    setFailed(false);
    startTransition(async () => {
      setKeys(next);
      let ok = false;
      try {
        ok = (await savePinnedPagesAction(next)).ok;
      } catch {
        ok = false;
      }
      if (!ok) setFailed(true);
    });
  }

  return {
    keys,
    full: pinsFull(keys),
    failed,
    dismiss: () => setFailed(false),
    // Full: the control says so and nothing is dropped.
    toggle: (key: string) => save(togglePin(keys, key)),
    move: (key: string, by: -1 | 1) => save(movePin(keys, key, by)),
    place: (key: string, before: string | null) => save(placePin(keys, key, before)),
  };
}
