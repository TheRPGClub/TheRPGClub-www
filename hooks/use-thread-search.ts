"use client";

import { useEffect, useState } from "react";
import type { ApiCollection, ThreadSearchResult } from "@/lib/api/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The shortest name worth searching threads for.
export const MIN_THREAD_QUERY = 2;

const THREAD_SEARCH_ROLES = "Only Regulars, Moderators, Admins and Superadmins can search threads.";

// Discord threads by name, for linking one to a game: debounced, the older
// search aborted by a newer one. Bump `refreshKey` to read the same search
// again (after a link, so the row shows "Linked"). A failed search is a
// SearchProblem (a lapsed session asks the Member to sign in again).
export function useThreadSearch(query: string, refreshKey: number) {
  const [results, setResults] = useState<ThreadSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchProblem | null>(null);

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
        if (!res.ok) {
          setError(searchProblem(res.status, { forbidden: THREAD_SEARCH_ROLES }));
          return;
        }
        const body = (await res.json()) as ApiCollection<ThreadSearchResult>;
        setResults(body.data);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(searchProblem(null));
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
