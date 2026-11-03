"use client";

import { useEffect, useState, useTransition } from "react";
import { getBotJobAction, type BotJobReadResult } from "@/app/actions/bot-jobs";
import type { BotJob } from "@/lib/api/types";
import { BOT_JOB_REFRESH_DELAYS_MS, isBotJobSettled } from "@/lib/bot-jobs";

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

export interface BotJobState {
  // The latest read, or the job handed in; null until the first read lands.
  job: BotJob | null;
  error: string | null;
  // A read that can't succeed on a retry (403, 404): no manual check either.
  stuck: boolean;
  // The automatic refresh run is still going.
  refreshing: boolean;
  // A manual "Check again" read is in flight.
  checking: boolean;
  checkAgain: () => void;
}

// Follows one bot job: re-reads it at `delays` (BOT_JOB_REFRESH_DELAYS_MS by
// default; BOT_JOB_LONG_REFRESH_DELAYS_MS for a job that runs for minutes)
// until it is done or failed, then stops and leaves `checkAgain` for a
// manual read. A read due while the tab is hidden waits until it is shown
// again. The caller keys its component on the job id so a new job starts a
// new run. <BotJobStatus> and <ProofCard> both read a job through this.
export function useBotJob(
  jobId: number,
  initialJob?: BotJob | null,
  delays: readonly number[] = BOT_JOB_REFRESH_DELAYS_MS,
): BotJobState {
  const [job, setJob] = useState<BotJob | null>(initialJob ?? null);
  const [error, setError] = useState<string | null>(null);
  // The refresh run, decided once at mount: skipped when the job is already
  // settled, and opened with an immediate read when none was handed in.
  const [plan] = useState(() => ({
    run: !(initialJob && isBotJobSettled(initialJob)),
    delays: initialJob ? delays : [0, ...delays],
  }));
  const [refreshing, setRefreshing] = useState(plan.run);
  const [stuck, setStuck] = useState(false);
  const [checking, startTransition] = useTransition();

  useEffect(() => {
    if (!plan.run) return;
    let cancelled = false;
    let timer: number | undefined;
    let step = 0;

    const onVisible = () => {
      if (document.visibilityState === "hidden") return;
      document.removeEventListener("visibilitychange", onVisible);
      void tick();
    };

    const tick = async () => {
      if (document.visibilityState === "hidden") {
        document.addEventListener("visibilitychange", onVisible);
        return;
      }
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
      document.removeEventListener("visibilitychange", onVisible);
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

  return { job, error, stuck, refreshing, checking, checkAgain };
}
