"use client";

import { useEffect, useState } from "react";
import { pastPlayAction } from "@/app/actions/challenge-slots";
import { settlePastPlay, type PastPlay } from "@/lib/challenges/slot-requests";

// The past-play picker's list: the member's Game Completions from before
// their Run that fit an open year, read when the picker opens and again
// (debounced) as the title search changes. A newer read wins over a slower
// older one; a read that fails or throws shows its error and always ends
// the loading state.
export function usePastPlay(runId: number, open: boolean) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PastPlay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let current = true;
    const timer = setTimeout(
      async () => {
        setLoading(true);
        try {
          const result = await settlePastPlay(() => pastPlayAction(runId, query));
          if (!current) return;
          if (result.ok) {
            setItems(result.data);
            setError(null);
          } else {
            setError(result.error);
          }
        } finally {
          if (current) setLoading(false);
        }
      },
      query ? 250 : 0,
    );
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [runId, open, query]);

  return { query, setQuery, items, error, loading };
}
