import { apiFetch } from "@/lib/api";
import type { ApiCollection, Game } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import type { WinnerFilter } from "@/lib/games/index-href";

// The game index's reads: the club's GameDB, by search, winner filter and
// page, or newest first.

export const PAGE_SIZE = 24;
export const NEWEST_SIZE = 12;
const GAMES_REVALIDATE_SECONDS = 300;

export const numberFormat = new Intl.NumberFormat("en-US");

export const WINNER_LABEL: Record<"gotm" | "nr_gotm", string> = {
  gotm: "GOTM winners",
  nr_gotm: "NR-GOTM winners",
};

export interface GamesResult {
  games: Game[];
  total: number;
  totalPages: number;
}

// null when the read failed, so the page can tell an outage from no matches.
export async function fetchGames({
  q = "",
  winner = null,
  page = 1,
  per = PAGE_SIZE,
  sort = "title",
}: {
  q?: string;
  winner?: WinnerFilter;
  page?: number;
  per?: number;
  // "newest" is most recently added to the GameDB; the API ignores it
  // alongside a search.
  sort?: "title" | "newest";
}): Promise<GamesResult | null> {
  const qs = new URLSearchParams({ per: String(per), page: String(page) });
  if (q) qs.set("q", q);
  if (winner) qs.set("winner", winner);
  if (sort !== "title") qs.set("sort", sort);
  try {
    const res = await apiFetch(`/api/v1/games?${qs}`, {
      next: { revalidate: GAMES_REVALIDATE_SECONDS, tags: ["games"] },
    });
    if (!res.ok) return null;
    const body: ApiCollection<Game> = await res.json();
    // The server paginates and clamps the page size; take its counts rather
    // than recomputing them.
    const { total, totalPages } = paginationOf(body.meta, body.data.length);
    return { games: body.data, total, totalPages };
  } catch {
    return null;
  }
}
