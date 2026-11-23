"use client";

import { useEffect, useRef, useState } from "react";

import { saveDraftAction, saveRevisionDraftAction, type ReviewInput } from "@/app/actions/reviews";
import { createAutosave, type Autosave, type AutosaveStatus } from "@/lib/reviews/autosave";

/**
 * Saves a Draft as it is written. `input` is the form as it stands; a change
 * to what it would save (not merely a new object, nor the editor reporting
 * its first value) starts the autosave's wait. A null target switches it
 * off: a Published take saves only when asked. The target is a Draft Review
 * or a Draft Revision.
 */
export function useDraftAutosave(target: DraftTarget | null, input: ReviewInput) {
  // One string, so the effects below restart only for another Draft.
  const key = target ? `${target.kind}:${target.id}` : null;
  const [status, setStatus] = useState<AutosaveStatus>({ kind: "idle" });
  // Why the last save was refused, when the server said (a weighting that
  // doesn't add up, say); a dropped connection has no words of its own.
  const [error, setError] = useState<string | null>(null);
  const autosave = useRef<Autosave<ReviewInput> | null>(null);
  const json = JSON.stringify(input);
  // What is already saved or on its way, so an unchanged form never saves.
  const queued = useRef(json);

  useEffect(() => {
    if (key === null) return;
    const [kind, idText] = key.split(":");
    const id = Number(idText);
    const instance = createAutosave<ReviewInput>({
      save: async (snapshot) => {
        try {
          const result =
            kind === "revision"
              ? await saveRevisionDraftAction(id, snapshot)
              : await saveDraftAction(id, snapshot);
          setError(result.ok ? null : (result.error ?? null));
          if (!result.ok && result.refused) return "refused";
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
  }, [key]);

  useEffect(() => {
    if (json === queued.current) return;
    queued.current = json;
    autosave.current?.change(JSON.parse(json) as ReviewInput);
  }, [json]);

  // Leaving with words not yet saved asks first.
  useEffect(() => {
    if (key === null) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (autosave.current?.dirty()) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [key]);

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

export interface DraftTarget {
  kind: "review" | "revision";
  id: number;
}

export type DraftAutosave = ReturnType<typeof useDraftAutosave>;
