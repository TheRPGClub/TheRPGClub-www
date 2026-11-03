"use client";

import { AlertTriangle, Check, Clock, Loader2, RefreshCw } from "lucide-react";
import type { BotJob } from "@/lib/api/types";
import { botJobPhase, botJobStatusCopy, isBotJobSettled } from "@/lib/bot-jobs";
import { useBotJob, type BotJobState } from "@/hooks/use-bot-job";
import { Chip } from "@/components/issue/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BotJobStatusProps {
  // The job id the action returned.
  jobId: number;
  // The job as the action returned it, when it did; saves the first read.
  initialJob?: BotJob | null;
  // The Discord side of the action in the member's words, e.g. "Your DM".
  what?: string;
  // Staff surfaces only: show what the bot reported once it is done.
  showResult?: boolean;
  className?: string;
}

// Whether the Discord side of an action has happened: queued, done, or
// failed with the bot's error. Mount it right after the action that queued
// the job; it re-reads the job a few times, then offers "Check again".
export function BotJobStatus(props: BotJobStatusProps) {
  // Keyed so a new job starts its own refresh run.
  return <BotJobStatusInner key={props.jobId} {...props} />;
}

function BotJobStatusInner({ jobId, initialJob, what, showResult, className }: BotJobStatusProps) {
  const state = useBotJob(jobId, initialJob);
  return <BotJobStatusView state={state} what={what} showResult={showResult} className={className} />;
}

// The status line for a job someone else is following with useBotJob (the
// proof card does, so its stamp and this line share one refresh run).
export function BotJobStatusView({
  state,
  what,
  showResult,
  className,
}: {
  state: BotJobState;
  what?: string;
  showResult?: boolean;
  className?: string;
}) {
  const { job, error, stuck, refreshing, checking, checkAgain } = state;
  const phase = job ? botJobPhase(job.status) : "queued";
  const copy = job
    ? botJobStatusCopy(job, what, { showResult })
    : { label: "Queued", detail: "Checking with the bot." };
  const settled = job ? isBotJobSettled(job) : false;
  const busy = refreshing || checking;

  // Never read and never will be (403, 404): say why, with no status to show.
  if (!job && stuck) {
    return (
      <div role="status" className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm", className)}>
        <Chip>
          <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
          Unavailable
        </Chip>
        <span className="text-paper-dim">{error}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm", className)}
    >
      <Chip tone={phase === "done" ? "highlight" : "neutral"}>
        <PhaseIcon phase={phase} busy={busy} />
        {copy.label}
      </Chip>
      <span className={phase === "failed" ? "text-destructive" : "text-paper-dim"}>
        {copy.detail}
      </span>
      {error && <span className="text-destructive">{error}</span>}
      {!settled && !stuck && !refreshing && (
        <Button type="button" variant="outline" size="sm" disabled={checking} onClick={checkAgain}>
          <RefreshCw data-icon="inline-start" className={checking ? "motion-safe:animate-spin" : undefined} />
          Check again
        </Button>
      )}
    </div>
  );
}

function PhaseIcon({ phase, busy }: { phase: ReturnType<typeof botJobPhase>; busy: boolean }) {
  const className = "size-3.5 shrink-0";
  if (phase === "done") return <Check aria-hidden className={className} />;
  if (phase === "failed") return <AlertTriangle aria-hidden className={className} />;
  if (busy) return <Loader2 aria-hidden className={`${className} motion-safe:animate-spin`} />;
  return <Clock aria-hidden className={className} />;
}
