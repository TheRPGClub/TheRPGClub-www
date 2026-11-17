"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiCollection } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { hasPoolDefinition, poolDefinition, type ChallengeDraft } from "@/lib/challenges/form";
import type { PoolGame } from "@/lib/challenges/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The form's live Pool: once the draft names a franchise, a collection or a
// game, a short pause after each change asks the API what the Pool resolves
// to (`/api/challenges/pool-preview`), without the games left out so their
// covers stay on the wall to put back. The newest request wins.
export function usePoolPreview(draft: ChallengeDraft) {
  const [games, setGames] = useState<PoolGame[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<SearchProblem | null>(null);
  const definition = useMemo(() => JSON.stringify(poolDefinition(draft, { withExcluded: false })), [draft]);
  const active = draft.format === "pool" && hasPoolDefinition(draft);

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

  const excluded = new Set(draft.excluded.map((g) => g.game_id));
  const shown = active ? games : [];
  return {
    games: shown,
    loading: active && loading,
    problem: active ? problem : null,
    // The Pool as it will save: the preview less the games left out.
    size: active ? total - shown.filter((g) => excluded.has(g.game_id)).length : 0,
    known: active && !loading && problem === null && games.length > 0,
  };
}
