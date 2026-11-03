"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Check, Clock, Loader2, RefreshCw } from "lucide-react";
import { getBotJobAction, type BotJobReadResult } from "@/app/actions/bot-jobs";
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

const LOST = "Lost touch with the club's server. Check again in a moment.";

// One status read. A rejected Server Action call (a network drop, a 5xx on
// the action itself) comes back as a non-final error instead of throwing.
async function readJob(jobId: number): Promise<BotJobReadResult & { lost?: boolean }> {
  try {
    return await getBotJobAction(jobId);
  } catch {
    return { ok: false, error: LOST, lost: true };
  }
}

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
  // settled, and opened with an immediate read when none was handed in.
  const [plan] = useState(() => ({
    run: !(initialJob && isBotJobSettled(initialJob)),
    delays: initialJob ? BOT_JOB_REFRESH_DELAYS_MS : [0, ...BOT_JOB_REFRESH_DELAYS_MS],
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
      const result = await readJob(jobId);
      if (cancelled) return;
      if (result.lost) {
        // The call itself failed: stop and offer "Check again".
        setError(result.error ?? LOST);
        setRefreshing(false);
        return;
      }
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
      if (step < plan.delays.length) {
        timer = window.setTimeout(tick, plan.delays[step]);
      } else {
        setRefreshing(false);
      }
    };

    timer = window.setTimeout(tick, plan.delays[0]);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [jobId, plan]);

  const checkAgain = () => {
    startTransition(async () => {
      const result = await readJob(jobId);
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
