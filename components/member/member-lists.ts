import type { User, UserProfileCounts } from "@/lib/api/types";

// The member's lists as the profile and the list pages name them, in the
// order the list switcher shows them.
export type MemberListKey =
  | "now_playing"
  | "favorites"
  | "completed"
  | "reviews"
  | "backlog"
  | "collection";

export const MEMBER_LISTS: {
  key: MemberListKey;
  label: string;
  path: string;
}[] = [
  { key: "now_playing", label: "Playing", path: "now-playing-games" },
  { key: "favorites", label: "Favorites", path: "favorite-games" },
  { key: "completed", label: "Completed", path: "completed-games" },
  { key: "reviews", label: "Reviews", path: "reviews" },
  { key: "backlog", label: "Backlog", path: "backlogged-games" },
  { key: "collection", label: "Collection", path: "collected-games" },
];

export type MemberCounts = Partial<Record<MemberListKey, number>>;

// `GET /users/:id` sends `counts` on the profile payload. Its keys are the
// API's own (`completions`, `collections`), not the ones the UserProfile type
// declares (`completed`, `collection`), so both spellings are read.
export function memberCounts(
  // The profile payload carries counts; a plain User (list pages) does not.
  user: (User & { counts?: Partial<UserProfileCounts> }) | null | undefined,
): MemberCounts {
  const raw = user?.counts;
  if (!raw) return {};
  return {
    now_playing: raw.now_playing,
    favorites: raw.favorites,
    completed: raw.completions,
    reviews: raw.reviews,
    backlog: raw.backlog,
    collection: raw.collections,
  };
}

export function memberName(user: User): string {
  return user.global_name ?? user.username ?? user.user_id;
}

export function memberListHref(userId: string, key: MemberListKey): string {
  const list = MEMBER_LISTS.find((l) => l.key === key)!;
  return `/members/${userId}/${list.path}`;
}

// The completion's year as the API files it (`EXTRACT(YEAR FROM
// completed_at)` on the stored UTC timestamp), or null when undated.
export function completionYear(completedAt: string | null): string | null {
  if (!completedAt) return null;
  const year = completedAt.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

// The completion's month key ("2026-08"), UTC like the year.
export function completionMonth(completedAt: string | null): string | null {
  if (!completedAt) return null;
  const month = completedAt.slice(0, 7);
  return /^\d{4}-\d{2}$/.test(month) ? month : null;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthLabel(monthKey: string, long = false): string {
  const [y, m] = monthKey.split("-");
  const index = Number(m) - 1;
  if (long) {
    return `${new Date(Date.UTC(Number(y), index, 1)).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })} ${y}`;
  }
  return `${MONTHS[index] ?? m} ${y}`;
}

export function monthShort(monthKey: string): string {
  return MONTHS[Number(monthKey.split("-")[1]) - 1] ?? monthKey;
}

// "Aug 9, 2026" in UTC, for a completion or review date.
export function shortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// The API serialises `final_playtime_hrs` as a decimal string ("20.0"), the
// type says number; either reads as hours, trimmed of a trailing ".0".
export function playtimeHours(value: unknown): string | null {
  const n = typeof value === "number" ? value : Number(value);
  if (value == null || !Number.isFinite(n) || n <= 0) return null;
  return `${Number.isInteger(n) ? n : n.toFixed(1)}h`;
}
