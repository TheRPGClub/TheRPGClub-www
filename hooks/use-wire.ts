"use client";

import { useEffect, useState, useTransition } from "react";
import { listBotJobsAction } from "@/app/actions/bot-jobs";
import type { BotJob, CollectionMeta } from "@/lib/api/types";
import {
  appendOlderJobs,
  BOT_JOB_REFRESH_DELAYS_MS,
  isBotJobSettled,
  mergeFirstPage,
} from "@/lib/bot-jobs";

const LOST = "Lost touch with the club's server.";

// The wire's jobs: while a job on it is still queued it re-reads page 1 a
// few times (walking the delays once; a manual refresh starts over), and
// `loadOlder` adds the next page under it.
export function useWire(initialJobs: BotJob[], initialMeta: CollectionMeta | null, initialError?: string | null) {
  const [jobs, setJobs] = useState(initialJobs);
  const [next, setNext] = useState<number | null>(initialMeta?.next ?? null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, startLoading] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const waiting = jobs.some((j) => !isBotJobSettled(j));
  // Bumped by each automatic re-read, so the run walks the delays once.
  const [step, setStep] = useState(0);

  const refresh = (manual: boolean) =>
    startRefresh(async () => {
      const result = await listBotJobsAction(1).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? LOST);
        return;
      }
      setError(null);
      const fresh = result.data;
      setJobs((current) => mergeFirstPage(fresh, current));
      if (manual) setStep(0);
      else setStep((s) => s + 1);
    });

  useEffect(() => {
    if (!waiting || step >= BOT_JOB_REFRESH_DELAYS_MS.length) return;
    const timer = window.setTimeout(() => refresh(false), BOT_JOB_REFRESH_DELAYS_MS[step]);
    return () => window.clearTimeout(timer);
  }, [waiting, step]);

  const loadOlder = () => {
    if (next == null) return;
    startLoading(async () => {
      const result = await listBotJobsAction(next).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? LOST);
        return;
      }
      const older = result.data;
      setJobs((current) => appendOlderJobs(current, older));
      setNext(result.meta?.next ?? null);
    });
  };

  return { jobs, next, error, loading, refreshing, refresh: () => refresh(true), loadOlder };
}
