// A member's Pinned Pages (spec api#416, tickets api#418, api#419): the keys the
// session carries, in the member's order. The API keeps the list, decides
// which keys a member can see and keeps the hidden ones through a save; the
// website only adds, removes and sends the visible list back whole.
// Client-safe: no server imports.
import type { AppSession } from "@/lib/auth-types";
import { CLUB_DEFAULT_PINS, CLUB_PAGES, STAFF_PAGE } from "@/lib/sidebar";

export const PIN_LIMIT = 6;

export const PINS_FULL = `Pinned list full (${PIN_LIMIT}). Unpin one first.`;
export const PINS_NOT_SAVED = "Couldn't save your Pinned Pages";

const PIN_KEYS = new Set<string>([
  ...CLUB_PAGES.map((p) => p.key),
  ...Object.values(STAFF_PAGE).map((p) => p.key),
]);

// The session's list; an API without Pinned Pages yet sends none, and then
// everyone has the club default.
export function memberPins(sessionPins: readonly string[] | undefined): readonly string[] {
  return sessionPins ?? CLUB_DEFAULT_PINS;
}

// Whether the member saved their own list (Settings offers a reset then).
// An API that doesn't say reads as following the club default.
export function pinsCustomised(session: Pick<AppSession, "pinned_pages_customised">): boolean {
  return session.pinned_pages_customised === true;
}

// The club default's pages by name, in order: "Voting, Games, Members and
// News".
export function clubDefaultNames(): string {
  const names = CLUB_DEFAULT_PINS.map((key) => CLUB_PAGES.find((p) => p.key === key)?.label ?? key);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names.join("");
}

// Whether the visible list is at the limit. The API also counts pins the
// member can't see right now, so a save can still be refused when this says
// there is room.
export function pinsFull(keys: readonly string[]): boolean {
  return keys.length >= PIN_LIMIT;
}

// The list with `key` unpinned, or pinned at the bottom; null when pinning
// would pass the limit (nothing is dropped to make room).
export function togglePin(keys: readonly string[], key: string): string[] | null {
  if (keys.includes(key)) return keys.filter((k) => k !== key);
  if (pinsFull(keys)) return null;
  return [...keys, key];
}

// A list a member may send: page keys the website knows.
export function isPinKeyList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((k) => typeof k === "string" && PIN_KEYS.has(k));
}
