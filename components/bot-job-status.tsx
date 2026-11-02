"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Check, Clock, Loader2, RefreshCw } from "lucide-react";
import { getBotJobAction } from "@/app/actions/bot-jobs";
import type { BotJob } from "@/lib/api/types";
import {
  BOT_JOB_REFRESH_DELAYS_MS,
  botJobPhase,
  botJobStatusCopy,
  isBotJobSettled,
} from "@/lib/bot-jobs";
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
  className?: string;
}

// Whether the Discord side of an action has happened: queued, done, or
// failed with the bot's error. Mount it right after the action that queued
// the job; it re-reads the job a few times, then offers "Check again".
export function BotJobStatus(props: BotJobStatusProps) {
  // Keyed so a new job starts its own refresh run.
  return <BotJobStatusInner key={props.jobId} {...props} />;
}

function BotJobStatusInner({ jobId, initialJob, what, className }: BotJobStatusProps) {
  const [job, setJob] = useState<BotJob | null>(initialJob ?? null);
  const [error, setError] = useState<string | null>(null);
  // The refresh run, decided once at mount: skipped when the job is already
  // settled, and started a step in when the first read was handed in.
  const [plan] = useState(() => ({
    run: !(initialJob && isBotJobSettled(initialJob)),
    firstDelay: initialJob ? BOT_JOB_REFRESH_DELAYS_MS[0] : 0,
  }));
  const [refreshing, setRefreshing] = useState(plan.run);
  // A read that can't succeed on a retry (403, 404): no manual check either.
  const [stuck, setStuck] = useState(false);
  const [checking, startTransition] = useTransition();

  useEffect(() => {
    if (!plan.run) return;
    let cancelled = false;
    let timer: number | undefined;
    let step = 0;

    const tick = async () => {
      const result = await getBotJobAction(jobId);
      if (cancelled) return;
      if (result.ok && result.data) {
        setJob(result.data);
        setError(null);
        if (isBotJobSettled(result.data)) {
          setRefreshing(false);
          return;
        }
      } else {
        setError(result.error ?? "Couldn't check with the bot.");
        if (result.final) {
          setStuck(true);
          setRefreshing(false);
          return;
        }
      }
      step += 1;
      if (step < BOT_JOB_REFRESH_DELAYS_MS.length) {
        timer = window.setTimeout(tick, BOT_JOB_REFRESH_DELAYS_MS[step]);
      } else {
        setRefreshing(false);
      }
    };

    timer = window.setTimeout(tick, plan.firstDelay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [jobId, plan]);

  const checkAgain = () => {
    startTransition(async () => {
      const result = await getBotJobAction(jobId);
      if (result.ok && result.data) {
        setJob(result.data);
        setError(null);
      } else {
        setError(result.error ?? "Couldn't check with the bot.");
        if (result.final) setStuck(true);
      }
    });
  };

  const phase = job ? botJobPhase(job.status) : "queued";
  const copy = job
    ? botJobStatusCopy(job, what)
    : { label: "Queued", detail: "Checking with the bot." };
  const settled = job ? isBotJobSettled(job) : false;
  const busy = refreshing || checking;

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
