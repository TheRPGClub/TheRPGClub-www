"use client";

import { useEffect, useState } from "react";
import type { ApiCollection, User } from "@/lib/api/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The member search behind the staff member picker: once the query has two
// characters, a short pause after typing searches `/api/members/search`
// (the newest search wins). Bots are left out. A failed search is a
// SearchProblem (a lapsed session asks the Member to sign in again). `settled` is true once the
// results answer the query as it stands.
export function useMemberSearch(query: string) {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchProblem | null>(null);
  const [searched, setSearched] = useState<string | null>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/members/search?per=10&q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError(searchProblem(res.status));
          return;
        }
        const body = (await res.json()) as ApiCollection<User>;
        setResults(body.data.filter((user) => !user.is_bot));
        setSearched(trimmed);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError(searchProblem(null));
      } finally {
        // A newer search aborted this one and is still in flight.
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, hasQuery]);

  return { hasQuery, results, setResults, error, settled: !loading && searched === trimmed };
}
