"use client";

import { useOptimistic, useState, useTransition } from "react";
import { saveHiddenPlatformsAction } from "@/app/actions/hidden-platforms";
import { HIDDEN_PLATFORMS_NOT_SAVED, withHidden, withoutHidden } from "@/lib/hidden-platforms";

// Hide and Unhide on /releases and /settings. The API replaces the whole set,
// so each change sends the set as it reads after the change. The list moves
// at once (an optimistic set over the page's read), and springs back with the
// reason if the save fails. One save at a time: a second change while one is
// in flight would send a set that doesn't include the first.
export function useHiddenPlatforms(saved: readonly number[]) {
  const [ids, setOptimistic] = useOptimistic<readonly number[]>(saved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = (next: number[], onSaved?: () => void) => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await saveHiddenPlatformsAction(next);
      if (!result.ok) setError(result.error ?? HIDDEN_PLATFORMS_NOT_SAVED);
      else onSaved?.();
    });
  };

  return {
    ids,
    pending,
    error,
    hide: (id: number, onSaved?: () => void) => save(withHidden(ids, id), onSaved),
    unhide: (id: number) => save(withoutHidden(ids, id)),
  };
}
