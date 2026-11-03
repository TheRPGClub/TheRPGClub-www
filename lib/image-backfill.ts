import type { ImageBackfillRun, ImageBackfillStatus } from "@/lib/api/types";

// Download missing images (/admin/images): an API background run that imports
// IGDB images for every game with none stored. The page reads the latest run
// while one is in progress and keeps Start off until it has finished.

// Re-read the latest run this often while it is queued or running.
export const BACKFILL_POLL_MS = 3_000;

export function isBackfillInProgress(run: Pick<ImageBackfillRun, "status"> | null): boolean {
  return run?.status === "queued" || run?.status === "running";
}

// Games dealt with so far (imported, skipped or failed) and the share of
// the total, 0 to 100. A run with nothing to do reads as complete once done.
export function backfillProgress(
  run: Pick<ImageBackfillRun, "status" | "total" | "done" | "skipped" | "failed">,
): { handled: number; percent: number } {
  const handled = run.done + run.skipped + run.failed;
  if (run.total <= 0) return { handled, percent: run.status === "completed" ? 100 : 0 };
  return { handled, percent: Math.min(100, Math.round((handled / run.total) * 100)) };
}

export const BACKFILL_STATUS_LABEL: Record<ImageBackfillStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Finished",
  failed: "Stopped",
};
