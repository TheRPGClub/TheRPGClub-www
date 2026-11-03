"use client";

import { useEffect, useState, useTransition } from "react";
import { ImageDown } from "lucide-react";
import { latestBackfillAction, startBackfillAction } from "@/app/actions/superadmin-tools";
import type { ImageBackfillRun } from "@/lib/api/types";
import {
  BACKFILL_POLL_MS,
  BACKFILL_STATUS_LABEL,
  backfillProgress,
  isBackfillInProgress,
} from "@/lib/image-backfill";
import { agoText } from "@/lib/bot-jobs";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<ImageBackfillRun["status"], string> = {
  queued: "text-highlight",
  running: "text-highlight",
  completed: "text-ok",
  failed: "text-destructive",
};

// The count grid's rules: two by two on a phone, one row of four from sm.
const CELL_EDGE = [
  "pr-4",
  "border-l pl-4",
  "border-t pr-4 sm:border-t-0 sm:border-l sm:pl-4",
  "border-t border-l pl-4 sm:border-t-0",
];

// /admin/images: start the API's image download and follow it. While a run
// is queued or running the page re-reads it every few seconds and Start
// stays off; the API refuses a second run on its own too.
export function ImageBackfillDesk({
  initialRun,
  initialError,
}: {
  initialRun: ImageBackfillRun | null;
  initialError: string | null;
}) {
  const [run, setRun] = useState(initialRun);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();
  const live = isBackfillInProgress(run);

  // Follow a live run until it finishes; a read that fails says so and
  // tries again on the next beat.
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

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <div className="min-w-0">
        <p className="max-w-[60ch] text-paper-dim">
          The club&rsquo;s server looks up every GameDB game with no stored images on IGDB and saves
          its cover and art. Games with no IGDB id are skipped. It runs on the server, not the bot,
          so it carries on if you leave this page.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="highlight"
            onClick={start}
            disabled={pending || live}
            aria-describedby="backfill-start-note"
          >
            <ImageDown data-icon="inline-start" />
            {pending ? "Starting..." : "Download missing images"}
          </Button>
          <p id="backfill-start-note" className="text-[0.86rem] text-paper-mute">
            {live
              ? "A download is running. Start comes back when it finishes."
              : "One download runs at a time."}
          </p>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <figure className="relative">
        <div className="overflow-hidden rounded-md shadow-[0_24px_60px_rgb(0_0_0/0.55)]">
          {run ? <RunSheet run={run} /> : <EmptySheet />}
        </div>
      </figure>
    </div>
  );
}

function EmptySheet() {
  return (
    <div className="bg-ink-2 p-5">
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-paper-dim">No download yet</p>
      <p className="mt-4 border-t border-rule pt-4 text-paper-dim">
        The first download&rsquo;s progress shows here once it starts.
      </p>
    </div>
  );
}

// One run's progress: its status, a bar of the games dealt with, and the
// four counts. The latest error is quoted under them.
function RunSheet({ run }: { run: ImageBackfillRun }) {
  const isClient = useIsClient();
  const { handled, percent } = backfillProgress(run);
  const live = isBackfillInProgress(run);
  const when = run.finished_at ?? run.started_at ?? run.created_at;
  const whenLabel = run.finished_at ? "Finished" : run.started_at ? "Started" : "Queued";
  const cells = [
    { label: "Total", value: run.total },
    { label: "Done", value: run.done },
    { label: "Skipped", value: run.skipped },
    { label: "Failed", value: run.failed },
  ];

  return (
    <div className="bg-ink-2 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-label text-[0.85rem] tracking-[0.08em] text-paper-dim">
          Download #{run.id}
          {isClient && (
            <>
              {" "}
              · {whenLabel} {agoText(when, new Date())}
            </>
          )}
        </p>
        <span
          className={cn(
            "font-headline inline-flex items-center gap-2 text-[1.3rem] leading-none",
            STATUS_TONE[run.status],
          )}
        >
          {live && (
            <span
              aria-hidden
              className="size-2 rounded-full bg-current motion-safe:animate-pulse"
            />
          )}
          {BACKFILL_STATUS_LABEL[run.status]}
        </span>
      </div>

      <div className="mt-4 border-t border-rule pt-4" role="status" aria-live="polite">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-headline text-[3.4rem] leading-[0.85] tabular-nums">
            {percent}%
          </span>
          <span className="text-[0.86rem] text-paper-mute tabular-nums">
            {handled} of {run.total} games
          </span>
        </div>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden bg-ink-3"
          role="progressbar"
          aria-label="Games dealt with"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className={cn(
              "h-full transition-[width] duration-500",
              run.status === "failed" ? "bg-destructive" : "bg-paper",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 border-t border-rule sm:grid-cols-4">
        {cells.map((cell, i) => (
          <div key={cell.label} className={cn("border-rule py-3", CELL_EDGE[i])}>
            <dt className="font-label text-[0.78rem] tracking-[0.06em] text-paper-mute">
              {cell.label}
            </dt>
            <dd
              className={cn(
                "font-headline mt-1 text-[2.2rem] leading-[0.9] tabular-nums",
                cell.label === "Failed" && cell.value > 0 && "text-destructive",
              )}
            >
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      {run.last_error && (
        <blockquote className="mt-1 border-t border-dashed border-destructive/50 pt-3 text-[0.92rem] leading-[1.4] break-words text-destructive italic">
          <cite className="font-label mb-0.5 block text-[0.7rem] tracking-[0.08em] text-paper-mute not-italic">
            Latest error
          </cite>
          &ldquo;{run.last_error}&rdquo;
        </blockquote>
      )}
    </div>
  );
}
