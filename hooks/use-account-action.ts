"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ActionResult } from "@/app/actions/linked-accounts";

/**
 * Runs a Linked Account action (retry, sync, unlink) and keeps its error.
 * Success refreshes the page; a failure keeps the message, and refreshes too
 * when the answer was a cooldown, since the page's sync_available_at is then
 * stale.
 */
export function useAccountAction() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (
    action: () => Promise<ActionResult<unknown>>,
    fallback: string,
    onDone?: () => void,
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? fallback);
        if (result.syncAvailableAt) router.refresh();
        return;
      }
      onDone?.();
      router.refresh();
    });
  };

  return { run, error, setError, pending };
}
