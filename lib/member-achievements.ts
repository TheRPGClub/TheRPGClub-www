import type {
  AchievementProvider,
  AchievementSetsSort,
  AchievementSetsStatus,
  AchievementTotals,
} from "@/lib/api/types";
import { memberAchievementsHref } from "@/lib/achievements";
import { firstParam, type RawSearchParams } from "@/lib/search-params";

// Pure helpers behind a member's achievement pages: the tab, the Sets
// filters read from (and written back to) the URL, and which totals a
// member's Linked Accounts make worth showing. Unknown filter values are
// dropped here, since the API answers them with a 422.

export type MemberAchievementsTab = "sets" | "unlocks";

export const MEMBER_ACHIEVEMENTS_TABS: {
  key: MemberAchievementsTab;
  label: string;
}[] = [
  { key: "sets", label: "Sets" },
  { key: "unlocks", label: "Unlocks" },
];

export const PROVIDERS: AchievementProvider[] = [
  "retroachievements",
  "steam",
  "psn",
];

export const SET_STATUS_LABEL: Record<AchievementSetsStatus, string> = {
  in_progress: "In progress",
  completed: "Completed",
};

export const SET_SORT_LABEL: Record<AchievementSetsSort, string> = {
  recent: "Recent",
  progress: "Progress",
  title: "Title",
};

export const DEFAULT_SET_SORT: AchievementSetsSort = "recent";

// Page sizes: 48 sets fill 1, 2 and 3 columns evenly.
export const SETS_PER_PAGE = 48;
export const UNLOCKS_PER_PAGE = 50;

export interface SetsFilter {
  provider: AchievementProvider | null;
  status: AchievementSetsStatus | null;
  sort: AchievementSetsSort;
}

export interface MemberAchievementsQuery {
  tab: MemberAchievementsTab;
  filter: SetsFilter;
  page: number;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

export function parseMemberAchievementsQuery(
  raw: RawSearchParams,
): MemberAchievementsQuery {
  const page = Math.max(1, parseInt(firstParam(raw.page) ?? "1", 10) || 1);
  return {
    tab: oneOf(firstParam(raw.tab), ["sets", "unlocks"] as const) ?? "sets",
    filter: {
      provider: oneOf(firstParam(raw.provider), PROVIDERS),
      status: oneOf(
        firstParam(raw.status),
        Object.keys(SET_STATUS_LABEL) as AchievementSetsStatus[],
      ),
      sort:
        oneOf(
          firstParam(raw.sort),
          Object.keys(SET_SORT_LABEL) as AchievementSetsSort[],
        ) ?? DEFAULT_SET_SORT,
    },
    page,
  };
}

// The API query for GET /users/:id/achievements/sets.
export function setsApiQuery(filter: SetsFilter, page: number): string {
  const ps = new URLSearchParams({
    per: String(SETS_PER_PAGE),
    page: String(page),
    sort: filter.sort,
  });
  if (filter.provider) ps.set("provider", filter.provider);
  if (filter.status) ps.set("status", filter.status);
  return ps.toString();
}

// A link to the achievements page with `next` merged over `current`.
// Changing a filter or the tab starts again at page 1; defaults stay out of
// the URL.
export function memberAchievementsPageHref(
  userId: string,
  current: MemberAchievementsQuery,
  next: {
    tab?: MemberAchievementsTab;
    filter?: Partial<SetsFilter>;
    page?: number;
  },
): string {
  const tab = next.tab ?? current.tab;
  const filter = { ...current.filter, ...next.filter };
  const page =
    next.page ?? (next.tab !== undefined || next.filter ? 1 : current.page);

  const ps = new URLSearchParams();
  if (tab !== "sets") ps.set("tab", tab);
  if (tab === "sets") {
    if (filter.provider) ps.set("provider", filter.provider);
    if (filter.status) ps.set("status", filter.status);
    if (filter.sort !== DEFAULT_SET_SORT) ps.set("sort", filter.sort);
  }
  if (page > 1) ps.set("page", String(page));
  const base = memberAchievementsHref(userId);
  return ps.size ? `${base}?${ps}` : base;
}

export interface TotalStat {
  key: keyof AchievementTotals;
  label: [singular: string, plural: string];
  value: number;
}

// Unlocks and Completions always show. Masteries and points belong to
// RetroAchievements and Platinums to PSN, so those show only when the member
// has that Linked Account or has earned some anyway.
export function totalStats(
  totals: AchievementTotals,
  linked: AchievementProvider[],
): TotalStat[] {
  const has = (p: AchievementProvider) => linked.includes(p);
  const stats: (TotalStat & { show: boolean })[] = [
    { key: "unlocks", label: ["Unlock", "Unlocks"], value: totals.unlocks, show: true },
    { key: "completions", label: ["Completion", "Completions"], value: totals.completions, show: true },
    { key: "masteries", label: ["Mastery", "Masteries"], value: totals.masteries, show: has("retroachievements") || totals.masteries > 0 },
    { key: "platinums", label: ["Platinum", "Platinums"], value: totals.platinums, show: has("psn") || totals.platinums > 0 },
    { key: "points", label: ["RA point", "RA points"], value: totals.points, show: has("retroachievements") || totals.points > 0 },
  ];
  return stats
    .filter((s) => s.show)
    .map((s) => ({ key: s.key, label: s.label, value: s.value }));
}

// The DOM id of an Achievement's row on a set page, so a tap on its grid
// icon can jump to the details.
export function achievementRowId(id: number): string {
  return `achievement-${id}`;
}

// GET /achievement_sets/:id through a member's eyes. The set page and the
// running head both read it with this URL, so the request is shared.
export function setDetailPath(setId: string, userId: string): string {
  return `/api/v1/achievement_sets/${setId}?user_id=${encodeURIComponent(userId)}`;
}
