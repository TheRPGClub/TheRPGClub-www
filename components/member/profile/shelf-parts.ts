import {
  memberListHref,
  type MemberListKey,
} from "@/lib/members/member-lists";
import { formatPlaytime } from "@/lib/members/profile-playtime";

// Phones show this many spines per shelf; the rest are a tap on the list.
const MOBILE_SPINES = 6;

export function mobileCut(i: number): string {
  return i >= MOBILE_SPINES ? "max-sm:hidden" : "";
}

// The "+N more" end of a shelf.
export function shelfMore(userId: string, key: MemberListKey, total: number, shown: number) {
  return { count: total - shown, href: memberListHref(userId, key) };
}

// A spine's link: the game's page, when the entry carries the game.
export function spineHref(entry: { game?: unknown; gamedb_game_id: number }): string | null {
  return entry.game ? `/games/${entry.gamedb_game_id}` : null;
}

// A spine's hours: "88 h", "45 m", or "No time" for a game never played.
export function spineHours(minutes: number | null | undefined): string {
  return minutes ? formatPlaytime(minutes) : "No time";
}

// What a spine's paper tag says when it lifts.
export function spineLift(minutes: number | null | undefined, sub: string | null) {
  return { hours: spineHours(minutes), sub };
}

// A shelf sorted Most played says so where its own order's blurb was.
export const MOST_PLAYED_BLURB = "Most played on the left.";
