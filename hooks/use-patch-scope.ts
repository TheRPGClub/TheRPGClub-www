"use client";

import { useState } from "react";

import { coverPendingChangesAction, dismissPendingChangeAction } from "@/app/actions/pending-changes";
import {
  applyChange,
  applyCover,
  patchScope,
  type PendingChange,
  type PendingChangeActionResult,
} from "@/lib/patch-notes/pending-changes";

const UNREACHED = "Couldn't reach the site. Check your connection and try again.";
const UNREAD = "Saved, but the list didn't come back. Reload the page to see it.";

// Step 1's state (www#240): the Pending Changes Patch `number` covers or
// could, and its writes. Ticking saves the whole covered list at once;
// dismiss and undo save at once too. `onCovered` hears each new covered
// list with the one before it, so the editor can redraft an untouched
// template. `initial` is null when the read failed.
export function usePatchScope(
  number: number,
  initial: PendingChange[] | null,
  onCovered: (before: PendingChange[], after: PendingChange[]) => void,
) {
  const [changes, setChanges] = useState(initial);
  // The change being written, or "cover" for a tick.
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scope = changes ? patchScope(changes, number) : null;

  async function run(id: number, write: () => Promise<PendingChangeActionResult>, apply: (r: PendingChangeActionResult) => void) {
    if (busy !== null || !changes) return;
    setBusy(id);
    setError(null);
    try {
      const result = await write();
      if (result.ok) apply(result);
      else setError(result.error ?? UNREACHED);
    } catch {
      setError(UNREACHED);
    } finally {
      setBusy(null);
    }
  }

  function tick(id: number, covered: boolean) {
    if (!scope || !changes) return;
    const ids = scope.covered.map((c) => c.id).filter((c) => c !== id);
    if (covered) ids.push(id);
    void run(
      id,
      () => coverPendingChangesAction(number, ids),
      (result) => {
        if (!result.covered) return setError(UNREAD);
        const next = applyCover(changes, number, result.covered);
        setChanges(next);
        onCovered(scope.covered, patchScope(next, number).covered);
      },
    );
  }

  function dismiss(id: number, undo = false) {
    void run(
      id,
      () => dismissPendingChangeAction(number, id, undo),
      (result) => {
        if (!result.change) return setError(UNREAD);
        if (changes) setChanges(applyChange(changes, result.change));
      },
    );
  }

  return { scope, busy, error, tick, dismiss };
}

export type PatchScopeState = ReturnType<typeof usePatchScope>;
