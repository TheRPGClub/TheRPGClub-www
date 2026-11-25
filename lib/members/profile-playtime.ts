import { monthShort } from "@/lib/members/member-lists";
import { hoursText } from "@/lib/playtime/view";
import { dayOf } from "@/lib/shelf-forms/dates";

// Game hours on a member's profile (spec api#457, 3F+): the banner's total,
// each shelf's total, and the hours on each Now Playing book and spine. The
// API counts the minutes (Playtime::Ledger); this only reads and words them.

// What the member list endpoints add to each entry (api#460).
export interface ShelfPlaytime {
  // 0 with no Playtime, null for an entry with no game.
  playtime_minutes?: number | null;
}

// The date the Backlog, Collection and Favorites list items were added
// (the API's fix pass for spec api#457), for a lifted spine's tag.
export interface ShelfAdded {
  added_at?: string | null;
}

// "Sep 26": the club month and short year an entry was added, as the
// Completed shelf words its dates. Null without one.
export function addedMonth(addedAt: string | null | undefined): string | null {
  const day = dayOf(addedAt);
  return day ? `${monthShort(day.slice(0, 7))} ${day.slice(2, 4)}` : null;
}

export interface NowPlayingPlaytime extends ShelfPlaytime {
  // The open Playthrough's time; null when none is open.
  playthrough_minutes?: number | null;
}

// The bookcase's shelves that sort.
export type ShelfKey = "favorites" | "completed" | "backlog" | "collection";

const SHELF_KEYS: ShelfKey[] = ["favorites", "completed", "backlog", "collection"];

// `GET /users/:id`'s `playtime`. A shelf whose Feature the viewer can't use
// is left out, as `counts`.
interface ProfilePlaytimePayload {
  total_minutes: number;
  shelves?: Partial<Record<ShelfKey | "now_playing", number>>;
}

export function profilePlaytime(user: { playtime?: ProfilePlaytimePayload | null }) {
  const raw = user.playtime;
  if (!raw || typeof raw.total_minutes !== "number") return null;
  return { total: raw.total_minutes, shelves: raw.shelves ?? {} };
}

export type ProfilePlaytime = NonNullable<ReturnType<typeof profilePlaytime>>;

// "180 h", "6,912 h", "6.5 h", "45 m": the game page's wording (www#185).
export function formatPlaytime(minutes: number | null | undefined): string {
  return hoursText(Math.max(0, Math.round(minutes ?? 0)));
}

// A shelf's order: its own ("default": Ranked, Newest, the member's queue)
// or Most played. Each shelf keeps its own in the URL (`?completed_sort=`),
// so the server reads that shelf in that order.
export type ShelfSort = "default" | "most_played";
export type ShelfSorts = Record<ShelfKey, ShelfSort>;

const param = (key: ShelfKey) => `${key}_sort`;

export function parseShelfSorts(
  search: Record<string, string | string[] | undefined>,
): ShelfSorts {
  const sorts = {} as ShelfSorts;
  for (const key of SHELF_KEYS) {
    const raw = search[param(key)];
    const value = Array.isArray(raw) ? raw[0] : raw;
    sorts[key] = value === "most_played" ? "most_played" : "default";
  }
  return sorts;
}

// The list endpoint's query for a sort. "Newest" is no sort at all.
export function shelfSortQuery(sort: ShelfSort): string {
  return sort === "most_played" ? "&sort=most_played" : "";
}

// The profile with one shelf's sort changed and the others kept.
export function shelfSortHref(
  userId: string,
  sorts: ShelfSorts,
  key: ShelfKey,
  sort: ShelfSort,
): string {
  const next = { ...sorts, [key]: sort };
  const query = new URLSearchParams();
  for (const k of SHELF_KEYS) if (next[k] === "most_played") query.set(param(k), "most_played");
  const qs = query.toString();
  return `/members/${userId}${qs ? `?${qs}` : ""}`;
}
