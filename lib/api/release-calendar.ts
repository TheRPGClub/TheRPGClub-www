import { apiFetch } from "@/lib/api";
import type { CollectionMeta, UpcomingRelease } from "./types";

// The Release Calendar's read (spec api#389, `GET /upcoming_releases`): a
// month's Upcoming Releases (`month=YYYY-MM`, past or future) or, without
// one, every Upcoming Release from today on. It belongs to the Release
// Calendar Feature and 404s for a member who can't use it.
//
// Every page is read, so the page can draw a whole month and the whole list
// below it, and offer only the platforms that are on the calendar. The
// platform filter is applied here rather than by the API's `platform_id`,
// because the filter's options and the "all on other platforms" note need
// the unfiltered entries anyway.

const PER = 100;
// A guard, not a limit the calendar is expected to reach: 1,000 entries.
const MAX_PAGES = 10;
// Data Cache keys include the member's Authorization, so this stays per
// member. IGDB dates move weekly; a minute is plenty fresh.
const FETCH: RequestInit = { next: { revalidate: 60 } };

export interface UpcomingReleasesRead {
  entries: UpcomingRelease[];
  // True when the guard stopped the read before the last page.
  truncated: boolean;
}

// "not_found" when the API says the viewer can't use the Release Calendar,
// null when the read failed.
export async function fetchUpcomingReleases(
  month?: string,
): Promise<UpcomingReleasesRead | "not_found" | null> {
  const first = await readPage(month, 1);
  if (first === "not_found" || first === null) return first;
  const pages = Math.min(first.meta?.pages ?? 1, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => readPage(month, i + 2)),
  );
  const entries = [...first.data];
  for (const page of rest) {
    if (page === null || page === "not_found") return null;
    entries.push(...page.data);
  }
  return { entries, truncated: (first.meta?.pages ?? 1) > MAX_PAGES };
}

async function readPage(
  month: string | undefined,
  page: number,
): Promise<{ data: UpcomingRelease[]; meta: CollectionMeta | null } | "not_found" | null> {
  const ps = new URLSearchParams({ page: String(page), per: String(PER) });
  if (month) ps.set("month", month);
  try {
    const res = await apiFetch(`/api/v1/upcoming_releases?${ps}`, FETCH);
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: UpcomingRelease[]; meta?: CollectionMeta };
    return { data: body.data ?? [], meta: body.meta ?? null };
  } catch {
    return null;
  }
}
