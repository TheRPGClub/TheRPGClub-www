"use client";

import { useState, useTransition } from "react";
import { typedWordsMatch } from "@/lib/desk";

// What a guarded action answers: an error to show, or nothing when it went
// through (the confirm then closes).
export type TypedConfirmResult = { error?: string | null } | void;

// A typed-word confirm's state: open, the words typed so far, whether they
// match, and the action's error. It won't close while the action runs, and
// starts empty each time it opens.
export function useTypedConfirm(
  words: string,
  onConfirm: () => Promise<TypedConfirmResult> | TypedConfirmResult,
) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = typedWordsMatch(typed, words);

  const onOpenChange = (next: boolean) => {
    if (!next && pending) return;
    setOpen(next);
    setTyped("");
    setError(null);
  };

  const confirm = () => {
    if (!ready || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await onConfirm();
        if (result && result.error) setError(result.error);
        else setOpen(false);
      } catch {
        setError("Couldn't reach the club's server. Try again.");
      }
    });
  };

  return { open, onOpenChange, typed, setTyped, ready, error, pending, confirm };
}
