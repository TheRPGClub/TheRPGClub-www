"use client";

import { useEffect, useState } from "react";
import type { ApiCollection, ThreadSearchResult } from "@/lib/api/types";

// The shortest name worth searching threads for.
export const MIN_THREAD_QUERY = 2;

// Discord threads by name, for linking one to a game: debounced, the older
// search aborted by a newer one. Bump `refreshKey` to read the same search
// again (after a link, so the row shows "Linked").
export function useThreadSearch(query: string, refreshKey: number) {
  const [results, setResults] = useState<ThreadSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_THREAD_QUERY;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/threads/search?per=8&q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (res.status === 403) {
          throw new Error("Only Regulars, Moderators, Admins and Superadmins can search threads.");
        }
        if (!res.ok) throw new Error("Search failed. Try again.");
        const body = (await res.json()) as ApiCollection<ThreadSearchResult>;
        setResults(body.data);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        // A newer search aborted this one and is still in flight.
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, hasQuery, refreshKey]);

  return { hasQuery, results, loading, error };
}
