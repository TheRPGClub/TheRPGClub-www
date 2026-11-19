"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { savePinnedPagesAction } from "@/app/actions/pinned-pages";
import { pinsFull, togglePin } from "@/lib/pinned-pages";

const NOTICE_MS = 6000;

// The sidebar's pin and unpin. The list changes at once (an optimistic
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

  function toggle(key: string) {
    const next = togglePin(keys, key);
    // Full: the control says so and nothing is dropped.
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

  return { keys, full: pinsFull(keys), failed, dismiss: () => setFailed(false), toggle };
}
