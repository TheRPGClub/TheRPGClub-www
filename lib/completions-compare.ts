// Search-param handling for the compare-completions page
// (/members/[id]/completed-games/compare), kept pure so the page only fetches
// and renders. The API (GET /users/:id/completions/common) 422s on a bad
// `sort` or `year`, so anything unrecognised is dropped here instead.

import { firstParam, type RawSearchParams } from "@/lib/search-params";

export const COMPARE_SORTS = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
] as const;

export type CompareSort = (typeof COMPARE_SORTS)[number]["value"];

export const DEFAULT_COMPARE_SORT: CompareSort = "date_desc";

export interface CompareFilters {
  // The right-hand member; null when there is no one to compare with yet.
  with: string | null;
  // A four-digit year or "unknown" (games with an undated entry).
  year: string | null;
  platform: number | null;
  q: string;
  sort: CompareSort;
  page: number;
}

// `viewerId` is the signed-in member. When they are looking at someone else's
// page and pick nobody, the comparison defaults to them (left = page owner,
// right = viewer), matching the bot's context-menu "Compare completions".
export function parseCompareFilters(
  raw: RawSearchParams,
  ownerId: string,
  viewerId: string | null,
): CompareFilters {
  const param = (key: string) => firstParam(raw[key])?.trim() ?? "";
  const withParam = param("with");
  const fallback = viewerId && viewerId !== ownerId ? viewerId : null;

  const year = param("year").toLowerCase();
  const platform = parseInt(param("platform"), 10);
  const sort = param("sort");
  const page = parseInt(param("page"), 10);

  return {
    with: withParam || fallback,
    year: year === "unknown" || /^\d{4}$/.test(year) ? year : null,
    platform: Number.isInteger(platform) && platform > 0 ? platform : null,
    q: param("q"),
    sort: COMPARE_SORTS.some((s) => s.value === sort)
      ? (sort as CompareSort)
      : DEFAULT_COMPARE_SORT,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

// The API query for the filters; `per` is the page size the page asks for.
export function commonCompletionsQuery(
  filters: CompareFilters,
  per: number,
): URLSearchParams {
  const qs = new URLSearchParams();
  if (filters.with) qs.set("other_user_id", filters.with);
  if (filters.year) qs.set("year", filters.year);
  if (filters.platform) qs.set("platform_id", String(filters.platform));
  if (filters.q) qs.set("q", filters.q);
  qs.set("sort", filters.sort);
  qs.set("page", String(filters.page));
  qs.set("per", String(per));
  return qs;
}

// A link back to the compare page with the same filters, on another page.
// Defaults are left out so URLs stay short.
export function compareHref(
  ownerId: string,
  filters: CompareFilters,
  page: number,
): string {
  const qs = new URLSearchParams();
  if (filters.with) qs.set("with", filters.with);
  if (filters.year) qs.set("year", filters.year);
  if (filters.platform) qs.set("platform", String(filters.platform));
  if (filters.q) qs.set("q", filters.q);
  if (filters.sort !== DEFAULT_COMPARE_SORT) qs.set("sort", filters.sort);
  if (page > 1) qs.set("page", String(page));
  const base = `/members/${ownerId}/completed-games/compare`;
  return qs.size ? `${base}?${qs}` : base;
}

// Year options for the filter: this year back to 1980. Completions can be
// imported from other trackers, so the range reaches well before the club.
export function compareYearOptions(now = new Date()): number[] {
  const current = now.getFullYear();
  return Array.from({ length: current - 1979 }, (_, i) => current - i);
}
