"use client";

import { useOptimistic, useState, useTransition } from "react";

const SAVE_FAILED = "Couldn't save that switch. Try again.";

type SaveResult = { ok: boolean; error?: string | null };

// The settings switches' save: each flip saves the moment it happens. The
// switch moves at once (an optimistic change over the page's own read), holds
// while the API answers, and springs back with the reason if the save fails.
// The action refreshes the page, so `initial` is the API's fresh document once
// a save lands. Rows save independently (`idOf` names a row), and a pending row
// keeps its optimistic position over a refresh another row brought in.
export function useSwitchSaves<State, Change>({
  initial,
  apply,
  action,
  idOf,
}: {
  initial: State;
  apply: (state: State, change: Change) => State;
  action: (change: Change) => Promise<SaveResult>;
  idOf: (change: Change) => string;
}) {
  const [state, applyOptimistic] = useOptimistic(initial, apply);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [, startTransition] = useTransition();

  function save(change: Change) {
    const id = idOf(change);
    setPending((s) => new Set(s).add(id));
    setErrors((e) => {
      if (!(id in e)) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });

    startTransition(async () => {
      applyOptimistic(change);
      let result: SaveResult;
      try {
        result = await action(change);
      } catch {
        result = { ok: false, error: SAVE_FAILED };
      }
      if (!result.ok) {
        setErrors((e) => ({ ...e, [id]: result.error ?? SAVE_FAILED }));
      }
      setPending((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    });
  }

  return { state, pending, errors, save };
}
