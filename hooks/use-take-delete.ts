"use client";

import { useState, useTransition } from "react";

import type { ActionResult } from "@/app/actions/reviews";

/**
 * A delete on the score line, asked in place: `ask` opens the question,
 * `confirm` runs the action and then `done` (refresh, or leave the page);
 * a refusal stays on the question with the API's words.
 */
export function useTakeDelete(run: () => Promise<ActionResult<unknown>>, done: () => void) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await run().catch(() => ({ ok: false, error: undefined }) as ActionResult<unknown>);
      if (!result.ok) {
        setError(result.error ?? "Couldn't delete it. Try again.");
        return;
      }
      setAsking(false);
      done();
    });
  };

  return {
    asking,
    error,
    pending,
    ask: () => setAsking(true),
    keep: () => {
      setAsking(false);
      setError(null);
    },
    confirm,
  };
}
