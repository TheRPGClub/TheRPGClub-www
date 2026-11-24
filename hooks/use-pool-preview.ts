"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiCollection } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { hasSourcePreview, poolDefinition, sourcePreviewDefinition, type ChallengeDraft } from "@/lib/challenges/form";
import type { SourcePreview } from "@/lib/challenges/pool-editor";
import type { PoolGame } from "@/lib/challenges/types";
import { searchProblem, type SearchProblem } from "@/lib/search-problem";

// The Pool editor's sources: once the draft names a Franchise, a Series or
// a hand-picked Optional Game, a short pause after each change asks the API
// what they resolve to (`/api/challenges/pool-preview`), without Core and
// Left out, so the editor knows which games a source brings
// (lib/challenges/pool-editor). The newest request wins. When the sources
// pass one page, a count-only preview of the whole definition (Core and
// Left out applied) gives the Optional count the page can't.
export function usePoolPreview(draft: ChallengeDraft) {
  const [games, setGames] = useState<PoolGame[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<SearchProblem | null>(null);
  const definition = useMemo(() => JSON.stringify(sourcePreviewDefinition(draft)), [draft]);
  const active = draft.format === "pool" && hasSourcePreview(draft);
  const count = useOptionalCount(draft, active && !loading && problem === null && total > games.length);

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

  const sources: SourcePreview | null = active ? { games, total, optionalTotal: count.total ?? undefined } : null;
  return {
    sources,
    loading: active && (loading || count.loading),
    problem: active ? (problem ?? count.problem) : null,
    // Without sources there is nothing to wait for.
    known: !active || (!loading && problem === null && !count.loading && count.problem === null),
  };
}

// How many Optional Games the whole draft definition resolves to (the
// preview's total, less the Core Games it also returns), read with one game
// per page while `wanted`; null until it answers.
function useOptionalCount(draft: ChallengeDraft, wanted: boolean) {
  const [result, setResult] = useState<{ key: string; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<SearchProblem | null>(null);
  const definition = useMemo(() => JSON.stringify(poolDefinition(draft)), [draft]);
  const coreCount = draft.core.length;

  useEffect(() => {
    if (!wanted) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/challenges/pool-preview?per=1", {
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
        setResult({ key: definition, total: paginationOf(body.meta, body.data.length).total - coreCount });
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
  }, [definition, wanted, coreCount]);

  const current = wanted && result?.key === definition;
  return {
    total: current ? Math.max(0, result.total) : null,
    loading: wanted && (loading || !current) && problem === null,
    problem: wanted ? problem : null,
  };
}
