"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiCollection } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { hasSourcePreview, sourcePreviewDefinition, type ChallengeDraft } from "@/lib/challenges/form";
import type { SourcePreview } from "@/lib/challenges/pool-editor";
import type { PoolGame } from "@/lib/challenges/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The Pool editor's sources: once the draft names a Franchise, a Series or
// a hand-picked Optional Game, a short pause after each change asks the API
// what they resolve to (`/api/challenges/pool-preview`), without Core and
// Left out, so the editor knows which games a source brings
// (lib/challenges/pool-editor). The newest request wins.
export function usePoolPreview(draft: ChallengeDraft) {
  const [games, setGames] = useState<PoolGame[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<SearchProblem | null>(null);
  const definition = useMemo(() => JSON.stringify(sourcePreviewDefinition(draft)), [draft]);
  const active = draft.format === "pool" && hasSourcePreview(draft);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/challenges/pool-preview?per=500", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: JSON.parse(definition) }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setProblem(searchProblem(res.status));
          return;
        }
        const body = (await res.json()) as ApiCollection<PoolGame>;
        setGames(body.data);
        setTotal(paginationOf(body.meta, body.data.length).total);
        setProblem(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setProblem(searchProblem(null));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [definition, active]);

  const sources: SourcePreview | null = active ? { games, total } : null;
  return {
    sources,
    loading: active && loading,
    problem: active ? problem : null,
    // Without sources there is nothing to wait for.
    known: !active || (!loading && problem === null),
  };
}
