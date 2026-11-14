"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addGameFromIgdbAction } from "@/app/actions/igdb";
import type { Game, IgdbSearchCandidate } from "@/lib/api/types";
import { igdbErrorMessage, igdbSearchHref } from "@/lib/igdb";

// Delay before the picker's automatic IGDB search, so typing through an empty
// GameDB result doesn't spend an IGDB call per keystroke.
const AUTO_SEARCH_DELAY_MS = 400;

export type IgdbSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; results: IgdbSearchCandidate[] }
  | { status: "error"; message: string };

// The IGDB search behind "Not here? Add it from IGDB". `auto` searches on its
// own after a short delay (the picker: the member is mid-flow and asked for a
// game already); otherwise it waits for `run`. The caller keys its component
// by `query`, so a new search starts over.
export function useIgdbSearch(query: string, auto: boolean) {
  const [search, setSearch] = useState<IgdbSearchState>(() =>
    auto ? { status: "loading" } : { status: "idle" },
  );

  async function run(signal?: AbortSignal) {
    setSearch({ status: "loading" });
    try {
      const res = await fetch(igdbSearchHref(query), { signal });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSearch({
          status: "error",
          message: igdbErrorMessage("search", res.status, body.error),
        });
        return;
      }
      setSearch({
        status: "done",
        results: (body.data ?? []) as IgdbSearchCandidate[],
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setSearch({ status: "error", message: "IGDB search failed. Try again." });
    }
  }

  useEffect(() => {
    if (!auto) return;
    const controller = new AbortController();
    const timer = setTimeout(() => void run(controller.signal), AUTO_SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run reads only `query`, which keys the caller
  }, [auto]);

  return { search, run: () => void run() };
}

// Adding an IGDB result to the GameDB (`POST /games`). With `onAdded` the
// added game is handed back (the picker carries on its list flow); without
// it the game's page opens, and the row stays busy while it loads.
export function useIgdbAdd(onAdded?: (game: Game) => void) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();

  function add(hit: IgdbSearchCandidate) {
    setBusyId(hit.igdb_id);
    setRowError(null);
    startTransition(async () => {
      const result = await addGameFromIgdbAction(hit.igdb_id);
      if (!result.ok || !result.data) {
        setBusyId(null);
        setRowError({
          id: hit.igdb_id,
          message: result.error ?? "Couldn't add it. Try again.",
        });
        return;
      }
      if (onAdded) {
        setBusyId(null);
        onAdded(result.data);
      } else {
        // Stay busy while the game page loads.
        router.push(`/games/${result.data.game_id}`);
      }
    });
  }

  return { busyId, rowError, add };
}
