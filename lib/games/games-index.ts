import { apiFetch } from "@/lib/api";
import type { ApiCollection, Game } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import type { WinnerFilter } from "@/lib/games/index-href";
import {
  appendFacetParams,
  FACETS,
  type FacetKey,
  type FacetOption,
  type Facets,
} from "@/lib/games/index-facets";

// The game index's reads: the club's GameDB, by search, winner filter,
// facets and page, or newest first; and each facet's options.

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
  facets = {},
  page = 1,
  per = PAGE_SIZE,
  sort = "title",
}: {
  q?: string;
  winner?: WinnerFilter;
  facets?: Partial<Facets>;
  page?: number;
  per?: number;
  // "newest" is most recently added to the GameDB; the API ignores it
  // alongside a search.
  sort?: "title" | "newest";
}): Promise<GamesResult | null> {
  const qs = new URLSearchParams({ per: String(per), page: String(page) });
  if (q) qs.set("q", q);
  if (winner) qs.set("winner", winner);
  appendFacetParams(qs, facets);
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

// Where each facet's options come from, and their id and name fields.
// Platforms are only those some game is on: IGDB knows hundreds.
const FACET_SOURCES: Record<FacetKey, { path: string; id: string; name: string }> = {
  genre: { path: "/api/v1/genres", id: "genre_id", name: "name" },
  platform: { path: "/api/v1/platforms?with_games=true", id: "platform_id", name: "platform_name" },
  theme: { path: "/api/v1/themes", id: "theme_id", name: "name" },
  perspective: { path: "/api/v1/perspectives", id: "perspective_id", name: "name" },
  mode: { path: "/api/v1/modes", id: "mode_id", name: "name" },
};
const FACET_REVALIDATE_SECONDS = 86_400;

// Every facet's options, by name. A facet whose read failed has none, and
// its filter isn't shown.
export async function fetchFacetOptions(): Promise<Record<FacetKey, FacetOption[]>> {
  const lists = await Promise.all(FACETS.map(({ key }) => fetchFacet(key)));
  return Object.fromEntries(FACETS.map(({ key }, i) => [key, lists[i]])) as Record<FacetKey, FacetOption[]>;
}

async function fetchFacet(key: FacetKey): Promise<FacetOption[]> {
  const { path, id, name } = FACET_SOURCES[key];
  try {
    const res = await apiFetch(`${path}${path.includes("?") ? "&" : "?"}per=500`, {
      next: { revalidate: FACET_REVALIDATE_SECONDS, tags: ["game-facets"] },
    });
    if (!res.ok) return [];
    const body: ApiCollection<Record<string, unknown>> = await res.json();
    return body.data
      .map((row) => ({ id: Number(row[id]), name: String(row[name] ?? "") }))
      .filter((option) => option.id > 0 && option.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
