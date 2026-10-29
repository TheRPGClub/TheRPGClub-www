import { apiFetch } from "@/lib/api";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import type { GotmRound, GotmRoundsMeta } from "./types";

// Server-side reads for GOTM history (`/gotm_rounds`) and the current round
// (`/gotm_rounds/current`), plus the archive page's filter parsing.
//
// Both endpoints require auth. Next's Data Cache key includes the request
// headers (and so the member's Authorization), so cached reads are per member
// and a 401 is never shared. Callers still confirm a session first, so a
// logged-out render doesn't waste an unauthenticated fetch. The body is the
// same club-wide history for everyone.

export const GOTM_REVALIDATE_SECONDS = 300;
const GOTM_FETCH: RequestInit = {
  next: { revalidate: GOTM_REVALIDATE_SECONDS, tags: ["gotm"] },
};

export const GOTM_HISTORY_PATH = "/gotm";

export type GotmKind = "both" | "gotm" | "nr_gotm";
export type GotmSort = "desc" | "asc";

export interface GotmHistoryFilters {
  kind: GotmKind;
  year: number | null;
  q: string;
  sort: GotmSort;
  page: number;
}

export const GOTM_KIND_OPTIONS: { value: GotmKind; label: string }[] = [
  { value: "both", label: "GOTM & NR-GOTM" },
  { value: "gotm", label: "GOTM only" },
  { value: "nr_gotm", label: "NR-GOTM only" },
];

export const GOTM_SORT_OPTIONS: { value: GotmSort; label: string }[] = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

// Only values the API accepts reach it; anything else falls back to the
// default rather than turning into a 422.
export function parseGotmHistoryFilters(raw: RawSearchParams): GotmHistoryFilters {
  const kind = firstParam(raw.kind);
  const sort = firstParam(raw.sort);
  const year = firstParam(raw.year);
  const page = parseInt(firstParam(raw.page) ?? "", 10);

  return {
    kind: kind === "gotm" || kind === "nr_gotm" ? kind : "both",
    year: year && /^\d{4}$/.test(year) ? Number(year) : null,
    q: (firstParam(raw.q) ?? "").trim(),
    sort: sort === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

// Defaults stay off the query string so the canonical URL is the bare path.
function filterParams(filters: GotmHistoryFilters): URLSearchParams {
  const ps = new URLSearchParams();
  if (filters.kind !== "both") ps.set("kind", filters.kind);
  if (filters.year) ps.set("year", String(filters.year));
  if (filters.q) ps.set("q", filters.q);
  if (filters.sort !== "desc") ps.set("sort", filters.sort);
  return ps;
}

export function gotmHistoryHref(
  filters: GotmHistoryFilters,
  page = filters.page,
): string {
  const ps = filterParams(filters);
  if (page > 1) ps.set("page", String(page));
  return `${GOTM_HISTORY_PATH}${ps.size ? `?${ps}` : ""}`;
}

export function hasActiveGotmFilters(filters: GotmHistoryFilters): boolean {
  return filterParams(filters).size > 0;
}

export interface GotmRoundsPage {
  rounds: GotmRound[];
  meta: GotmRoundsMeta | null;
}

// null when the read failed, so the page can tell an outage from no matches.
export async function fetchGotmRounds(
  filters: GotmHistoryFilters,
): Promise<GotmRoundsPage | null> {
  const ps = filterParams(filters);
  ps.set("page", String(filters.page));
  try {
    const res = await apiFetch(`/api/v1/gotm_rounds?${ps}`, GOTM_FETCH);
    if (!res.ok) return null;
    const body = (await res.json()) as { data: GotmRound[]; meta: GotmRoundsMeta };
    return { rounds: body.data ?? [], meta: body.meta ?? null };
  } catch {
    return null;
  }
}

// The latest round with winners (not the one being voted on); null when there
// is none (404) or the read failed.
export async function fetchCurrentGotmRound(): Promise<GotmRound | null> {
  try {
    const res = await apiFetch("/api/v1/gotm_rounds/current", GOTM_FETCH);
    if (!res.ok) return null;
    return ((await res.json()) as { data: GotmRound }).data ?? null;
  } catch {
    return null;
  }
}
