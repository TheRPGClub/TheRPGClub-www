import "server-only";
import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type {
  AchievementSetProgress,
  AchievementSetsStatus,
  AchievementUnlock,
  ApiCollection,
} from "@/lib/api/types";
import { getSetTint } from "@/lib/achievements/tint";
import type { SetTint } from "@/lib/achievements/tint-color";
import {
  UNLOCKS_PER_PAGE,
  setsApiQuery,
  type MemberAchievementsQuery,
} from "@/lib/member-achievements";

// The reads behind the member achievements page's right page (the binder's
// index of sets or its list of Unlocks). Server only: it samples set tints.

// One page of a member's sets or Unlocks; `failed` when the read fails, so
// the page can say so instead of showing an empty binder.
export interface AchievementPage<T> {
  items: T[];
  total: number;
  totalPages: number;
  failed: boolean;
}

async function fetchPage<T>(path: string): Promise<AchievementPage<T>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return { items: [], total: 0, totalPages: 1, failed: true };
    const body: ApiCollection<T> = await res.json();
    const { total, totalPages } = paginationOf(body.meta, body.data.length);
    return { items: body.data, total, totalPages, failed: false };
  } catch {
    return { items: [], total: 0, totalPages: 1, failed: true };
  }
}

export type StatusCounts = Record<"all" | AchievementSetsStatus, number | null>;

// What the binder's right page shows for a query: on the index, a page of
// sets with each set's tint and every status's count (for the filter tabs);
// on the Unlocks view, a page of Unlocks.
export interface BinderPages {
  sets: AchievementPage<AchievementSetProgress> | null;
  tints: SetTint[];
  statusCounts: StatusCounts | null;
  unlocks: AchievementPage<AchievementUnlock> | null;
}

export async function fetchBinderPages(
  userId: string,
  query: MemberAchievementsQuery,
): Promise<BinderPages> {
  const base = `/api/v1/users/${encodeURIComponent(userId)}/achievements`;
  if (query.tab !== "sets") {
    const ps = new URLSearchParams({ per: String(UNLOCKS_PER_PAGE), page: String(query.page) });
    const unlocks = await fetchPage<AchievementUnlock>(`${base}/unlocks?${ps}`);
    return { sets: null, tints: [], statusCounts: null, unlocks };
  }
  const [sets, statusCounts] = await Promise.all([
    fetchPage<AchievementSetProgress>(`${base}/sets?${setsApiQuery(query.filter, query.page)}`),
    fetchStatusCounts(base, query),
  ]);
  const tints = await Promise.all(
    sets.items.map((row) =>
      getSetTint({ iconUrl: row.achievement_set.icon_url, setId: row.achievement_set.id }),
    ),
  );
  return { sets, tints, statusCounts, unlocks: null };
}

// Every status's set count under the current Provider filter, for the tabs.
// Each is a one-row read of its meta; a failed one leaves its tab unnumbered.
async function fetchStatusCounts(
  base: string,
  query: MemberAchievementsQuery,
): Promise<StatusCounts> {
  const count = async (status: AchievementSetsStatus | null) => {
    const ps = new URLSearchParams({ per: "1", page: "1" });
    if (query.filter.provider) ps.set("provider", query.filter.provider);
    if (status) ps.set("status", status);
    const page = await fetchPage<AchievementSetProgress>(`${base}/sets?${ps}`);
    return page.failed ? null : page.total;
  };
  const [all, in_progress, completed] = await Promise.all([
    count(null),
    count("in_progress"),
    count("completed"),
  ]);
  return { all, in_progress, completed };
}
