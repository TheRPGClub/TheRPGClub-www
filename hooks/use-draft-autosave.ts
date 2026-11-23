"use client";

import { useEffect, useRef, useState } from "react";

import { saveDraftAction, type ReviewInput } from "@/app/actions/reviews";
import { createAutosave, type Autosave, type AutosaveStatus } from "@/lib/reviews/autosave";

/**
 * Saves a Draft as it is written. `input` is the form as it stands; a change
 * to what it would save (not merely a new object, nor the editor reporting
 * its first value) starts the autosave's wait. Null `reviewId` switches it
 * off: a Published Review saves only when asked.
 */
export function useDraftAutosave(reviewId: number | null, input: ReviewInput) {
  const [status, setStatus] = useState<AutosaveStatus>({ kind: "idle" });
  // Why the last save was refused, when the server said (a weighting that
  // doesn't add up, say); a dropped connection has no words of its own.
  const [error, setError] = useState<string | null>(null);
  const autosave = useRef<Autosave<ReviewInput> | null>(null);
  const json = JSON.stringify(input);
  // What is already saved or on its way, so an unchanged form never saves.
  const queued = useRef(json);

  useEffect(() => {
    if (reviewId === null) return;
    const instance = createAutosave<ReviewInput>({
      save: async (snapshot) => {
        try {
          const result = await saveDraftAction(reviewId, snapshot);
          setError(result.ok ? null : (result.error ?? null));
          return result.ok;
        } catch {
          setError(null);
          return false;
        }
      },
      onStatus: setStatus,
    });
    autosave.current = instance;
    return () => {
      instance.dispose();
      autosave.current = null;
    };
  }, [reviewId]);

  useEffect(() => {
    if (json === queued.current) return;
    queued.current = json;
    autosave.current?.change(JSON.parse(json) as ReviewInput);
  }, [json]);

  // Leaving with words not yet saved asks first.
  useEffect(() => {
    if (reviewId === null) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (autosave.current?.dirty()) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [reviewId]);

  return {
    status,
    error,
    // Saves what is left now; true once the server has all of it.
    flush: () => autosave.current?.flush() ?? Promise.resolve(true),
    retryNow: () => autosave.current?.retryNow(),
    // Stops saving, for a Draft about to be discarded.
    stop: () => autosave.current?.dispose(),
  };
}

export type DraftAutosave = ReturnType<typeof useDraftAutosave>;
