"use client";

import { useEffect, useState } from "react";
import type { PoolSource } from "@/lib/challenges/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The franchise and collection search behind the form's source word: once
// the query has two characters, a short pause after typing searches
// `/api/challenges/pool-sources` (franchises first, then collections, with
// their game counts). The newest search wins.
export function usePoolSources(query: string) {
  const [results, setResults] = useState<PoolSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<SearchProblem | null>(null);
  const [searched, setSearched] = useState<string | null>(null);
  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/challenges/pool-sources?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setProblem(searchProblem(res.status));
          return;
        }
        const body = (await res.json()) as { data: PoolSource[] };
        setResults(body.data);
        setSearched(trimmed);
        setProblem(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setProblem(searchProblem(null));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, hasQuery]);

  return {
    hasQuery,
    results: hasQuery ? results : [],
    loading: hasQuery && loading,
    problem: hasQuery ? problem : null,
    settled: hasQuery && !loading && searched === trimmed,
  };
}
