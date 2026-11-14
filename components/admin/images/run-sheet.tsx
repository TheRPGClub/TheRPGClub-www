"use client";

import type { ImageBackfillRun } from "@/lib/api/types";
import { BACKFILL_STATUS_LABEL, backfillProgress, isBackfillInProgress } from "@/lib/image-backfill";
import { agoText } from "@/lib/bot-jobs";
import { useIsClient } from "@/hooks/use-is-client";
import { Progress } from "@/components/ui/progress";
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

// Before any download: where its progress will show.
export function EmptySheet() {
  return (
    <div className="bg-card p-5">
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-dim-foreground">No download yet</p>
      <p className="mt-4 border-t border-border pt-4 text-dim-foreground">
        The first download&rsquo;s progress shows here once it starts.
      </p>
    </div>
  );
}

// One run's progress: its status, a bar of the games dealt with, and the
// four counts. The latest error is quoted under them.
export function RunSheet({ run }: { run: ImageBackfillRun }) {
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
    <div className="bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-label text-[0.85rem] tracking-[0.08em] text-dim-foreground">
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

      <div className="mt-4 border-t border-border pt-4" role="status" aria-live="polite">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-headline text-[3.4rem] leading-[0.85] tabular-nums">
            {percent}%
          </span>
          <span className="text-[0.86rem] text-faint-foreground tabular-nums">
            {handled} of {run.total} games
          </span>
        </div>
        <Progress
          value={percent}
          aria-label="Games dealt with"
          tone={run.status === "failed" ? "destructive" : "neutral"}
          className="mt-3"
          trackClassName="h-1.5"
          indicatorClassName="duration-500"
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 border-t border-border sm:grid-cols-4">
        {cells.map((cell, i) => (
          <div key={cell.label} className={cn("border-border py-3", CELL_EDGE[i])}>
            <dt className="font-label text-[0.78rem] tracking-[0.06em] text-faint-foreground">
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
          <cite className="font-label mb-0.5 block text-[0.7rem] tracking-[0.08em] text-faint-foreground not-italic">
            Latest error
          </cite>
          &ldquo;{run.last_error}&rdquo;
        </blockquote>
      )}
    </div>
  );
}
