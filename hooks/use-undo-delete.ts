"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UNDO_DELAY_MS } from "@/lib/desk";

// What a delete request answers: nothing (or no error) when it went through.
export type UndoCommitResult = { error?: string | null } | void;

export interface UndoDelete<K> {
  // Keys waiting out the Undo bar; nothing has been sent for them yet.
  held: ReadonlySet<K>;
  // Keys whose delete went through. Hide them until the list re-reads.
  gone: ReadonlySet<K>;
  // Keys whose delete was refused, with the reason. The item is back.
  errors: ReadonlyMap<K, string>;
  // Start the bar for a key.
  hold: (key: K) => void;
  // Stop the bar: the delete is never sent.
  undo: (key: K) => void;
  delayMs: number;
}

// A delete held on the client behind an Undo bar: `hold` starts a timer and
// `commit` is only called when it runs out. Leaving the page (unmount, a
// client navigation, closing the tab) sends every held delete at once, so
// a delete the member didn't undo is never lost. Closing the tab is best
// effort: the browser may drop the request.
export function useUndoDelete<K extends string | number>({
  commit,
  delayMs = UNDO_DELAY_MS,
}: {
  commit: (key: K) => Promise<UndoCommitResult>;
  delayMs?: number;
}): UndoDelete<K> {
  const [held, setHeld] = useState<ReadonlySet<K>>(() => new Set());
  const [gone, setGone] = useState<ReadonlySet<K>>(() => new Set());
  const [errors, setErrors] = useState<ReadonlyMap<K, string>>(() => new Map());
  const timers = useRef(new Map<K, number>());
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  const send = useCallback((key: K) => {
    timers.current.delete(key);
    setHeld((prev) => without(prev, key));
    commitRef
      .current(key)
      .then((result) => {
        const error = result && result.error;
        if (error) setErrors((prev) => new Map(prev).set(key, error));
        else setGone((prev) => new Set(prev).add(key));
      })
      .catch(() => {
        setErrors((prev) => new Map(prev).set(key, "Couldn't reach the club's server. Try again."));
      });
  }, []);

  const hold = useCallback(
    (key: K) => {
      if (timers.current.has(key)) return;
      setErrors((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      setHeld((prev) => new Set(prev).add(key));
      timers.current.set(key, window.setTimeout(() => send(key), delayMs));
    },
    [delayMs, send],
  );

  const undo = useCallback((key: K) => {
    const timer = timers.current.get(key);
    if (timer === undefined) return;
    window.clearTimeout(timer);
    timers.current.delete(key);
    setHeld((prev) => without(prev, key));
  }, []);

  // Leaving the page sends what is still held, through `send`, so the held
  // set is cleared and the outcome recorded: a page restored from the
  // back/forward cache shows the entry gone (or back, with the refusal)
  // rather than a dead Undo bar.
  useEffect(() => {
    const pending = timers.current;
    const flush = () => {
      for (const [key, timer] of [...pending]) {
        window.clearTimeout(timer);
        send(key);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [send]);

  return { held, gone, errors, hold, undo, delayMs };
}

function without<K>(set: ReadonlySet<K>, key: K): ReadonlySet<K> {
  if (!set.has(key)) return set;
  const next = new Set(set);
  next.delete(key);
  return next;
}
