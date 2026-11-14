"use client";

import { useEffect, useState } from "react";
import type { ApiCollection, Game } from "@/lib/api/types";

// The GameDB search behind the game picker: once the query has two
// characters, a short pause after typing searches `/api/games/search` (the
// newest search wins). `searchedQuery` is the query `results` answer, so a
// caller can tell a stale or pending answer from this one.
export function useGameSearch(query: string) {
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/games/search?per=8&q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as ApiCollection<Game>;
        setResults(body.data);
        setSearchedQuery(trimmedQuery);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search failed. Try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery, hasQuery]);

  return { trimmedQuery, hasQuery, results, setResults, loading, error, searchedQuery };
}
