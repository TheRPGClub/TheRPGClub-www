"use client";

import { useEffect, useState } from "react";
import { cleanLinks } from "@/lib/codex/see-also";
import type { CodexEntryLink, CodexPart } from "@/lib/codex/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The See also picker's search (www#127): a short pause after typing
// searches the Club Codex's entries (`/api/codex/entries`, every part unless
// `part` keeps one), titles first, then the newest. The newest search wins;
// `settled` is true once the results answer the query as it stands.
export function useCodexEntrySearch(query: string, part: CodexPart | null = null) {
  const [results, setResults] = useState<CodexEntryLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchProblem | null>(null);
  const [searched, setSearched] = useState<string | null>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 1;
  const key = `${part ?? ""}:${trimmed}`;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams({ q: trimmed, per: "12" });
        if (part) qs.set("part", part);
        const res = await fetch(`/api/codex/entries?${qs}`, { signal: controller.signal });
        if (!res.ok) {
          setError(searchProblem(res.status));
          return;
        }
        const body = (await res.json()) as { data?: unknown };
        setResults(cleanLinks(body.data));
        setSearched(key);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError(searchProblem(null));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, hasQuery, part, key]);

  return { hasQuery, results, error, settled: !loading && searched === key };
}
