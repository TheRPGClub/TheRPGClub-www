"use client";

import { useSyncExternalStore } from "react";
import { sidebarPatchUnseen, type PatchMarkMoved, type PatchSeen } from "@/lib/patch-notes/patch-mark";

// The latest Patch Mark move made in this tab (ticket www#238). The frame
// around a page keeps the session it was drawn with, and a layout is kept
// across navigations, so a visit to Patch Notes tells the sidebar and the
// tab bar here rather than reloading them. Forward only, as the mark.
let moved: PatchMarkMoved | null = null;
const listeners = new Set<() => void>();

export function notePatchMarkMoved(next: PatchMarkMoved) {
  if (moved && moved.mark >= next.mark) return;
  moved = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Whether the sidebar's Patch Notes entry wears NEW: the session's word,
// until a visit in this tab moved the mark past the one it was drawn with.
export function usePatchUnseen(seen: PatchSeen): boolean {
  const last = useSyncExternalStore(subscribe, () => moved, () => null);
  return sidebarPatchUnseen(seen, last);
}
