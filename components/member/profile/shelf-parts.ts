import {
  memberListHref,
  type MemberListKey,
} from "@/components/member/member-lists";

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
