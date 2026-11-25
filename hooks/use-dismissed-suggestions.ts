"use client";

import { useCallback, useSyncExternalStore } from "react";
import { dismissedKey, parseDismissed } from "@/lib/games/game-edit/franchise-suggestions";

// The Franchise suggestions this member dismissed for this game (www#209),
// kept in the browser's localStorage. Storage that can't be read (a private
// window, blocked site data) reads as none dismissed, and a dismiss then
// lasts only for this page. The server render shows none dismissed.

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useDismissedSuggestions(memberId: string, gameId: number) {
  const key = dismissedKey(memberId, gameId);
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const dismissed = parseDismissed(raw);

  const dismiss = useCallback(
    (franchiseId: number) => {
      const next = JSON.stringify([...new Set([...parseDismissed(read(key)), franchiseId])]);
      memory.set(key, next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // Kept in memory for this page only.
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  return { isDismissed: (franchiseId: number) => dismissed.includes(franchiseId), dismiss };
}
