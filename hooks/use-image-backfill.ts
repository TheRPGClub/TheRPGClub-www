"use client";

import { useEffect, useState, useTransition } from "react";
import { latestBackfillAction, startBackfillAction } from "@/app/actions/superadmin-tools";
import type { ImageBackfillRun } from "@/lib/api/types";
import { BACKFILL_POLL_MS, isBackfillInProgress } from "@/lib/image-backfill";

// The image download run the desk follows: while it is queued or running
// it is re-read every few seconds (a failed read says so and tries again on
// the next beat). `start` asks for a new run; when one is already going it
// shows that run instead.
export function useImageBackfill(initialRun: ImageBackfillRun | null, initialError: string | null) {
  const [run, setRun] = useState(initialRun);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();
  const live = isBackfillInProgress(run);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const result = await latestBackfillAction().catch(() => null);
      if (cancelled) return;
      if (result?.ok) {
        setError(null);
        // A new object even when nothing moved, so the next beat is set.
        setRun(result.run ? { ...result.run } : null);
      } else {
        setError(result?.error ?? "Lost touch with the club's server. Trying again.");
        setRun((r) => (r ? { ...r } : r));
      }
    }, BACKFILL_POLL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [live, run]);

  const start = () => {
    setError(null);
    startTransition(async () => {
      const result = await startBackfillAction().catch(() => null);
      if (result?.ok && result.run) {
        setRun(result.run);
        return;
      }
      setError(result?.error ?? "Lost touch with the club's server. Try again.");
      // Already running: show that run's progress instead.
      if (result?.inProgress) {
        const latest = await latestBackfillAction().catch(() => null);
        if (latest?.ok && latest.run) setRun(latest.run);
      }
    });
  };

  return { run, error, pending, live, start };
}
