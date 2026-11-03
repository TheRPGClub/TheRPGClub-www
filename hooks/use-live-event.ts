"use client";

import { useEffect, useState, useTransition } from "react";
import { getLiveEventAction } from "@/app/actions/live-events";
import type { LiveEvent } from "@/lib/api/types";
import { BOT_JOB_REFRESH_DELAYS_MS } from "@/lib/bot-jobs";
import { isLiveEventSettled } from "@/lib/live-events";

const LOST = "Lost touch with the club's server. Check again in a moment.";

export interface LiveEventState {
  event: LiveEvent;
  error: string | null;
  refreshing: boolean;
  checking: boolean;
  // A read that can't succeed on a retry: no manual check either.
  stuck: boolean;
  checkAgain: () => void;
}

// Follows a just-created live event from queued to created (or failed),
// re-reading it on the bot job delays and then leaving a manual check. The
// event, not its job, holds the thread and event ids. The caller keys its
// component on the event id.
export function useLiveEvent(initial: LiveEvent): LiveEventState {
  const [event, setEvent] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [run] = useState(() => !isLiveEventSettled(initial));
  const [refreshing, setRefreshing] = useState(run);
  const [stuck, setStuck] = useState(false);
  const [checking, startTransition] = useTransition();

  const read = async () => {
    try {
      return await getLiveEventAction(initial.id);
    } catch {
      return { ok: false, error: LOST, final: false } as const;
    }
  };

  useEffect(() => {
    if (!run) return;
    let cancelled = false;
    let timer: number | undefined;
    let step = 0;
    const tick = async () => {
      const result = await read();
      if (cancelled) return;
      if (result.ok && result.data) {
        setEvent(result.data);
        setError(null);
        if (isLiveEventSettled(result.data)) {
          setRefreshing(false);
          return;
        }
      } else {
        setError(result.error ?? LOST);
        if (result.final) {
          setStuck(true);
          setRefreshing(false);
          return;
        }
      }
      step += 1;
      if (step < BOT_JOB_REFRESH_DELAYS_MS.length) timer = window.setTimeout(tick, BOT_JOB_REFRESH_DELAYS_MS[step]);
      else setRefreshing(false);
    };
    timer = window.setTimeout(tick, BOT_JOB_REFRESH_DELAYS_MS[0]);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `read` only closes over the id, fixed for this component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const checkAgain = () =>
    startTransition(async () => {
      const result = await read();
      if (result.ok && result.data) {
        setEvent(result.data);
        setError(null);
      } else {
        setError(result.error ?? LOST);
        if (result.final) setStuck(true);
      }
    });

  return { event, error, refreshing, checking, stuck, checkAgain };
}
