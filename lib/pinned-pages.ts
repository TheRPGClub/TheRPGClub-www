// A member's Pinned Pages (spec api#416, tickets api#418, api#419): the keys the
// session carries, in the member's order. The API keeps the list, decides
// which keys a member can see and keeps the hidden ones through a save; the
// website only adds, removes and sends the visible list back whole. The API
// also owns the club default and the limit (ADR 0012): the session says
// both, and how many visible pins the member has room for.
// Client-safe: no server imports.
import type { AppSession } from "@/lib/auth-types";
import { CLUB_PAGES, STAFF_PAGE } from "@/lib/sidebar";

// Only for an API that doesn't send the default and the limit yet; the
// session's own values win (PinnedPages::DEFAULT and LIMIT in the API).
const FALLBACK_DEFAULT: readonly string[] = ["voting", "games", "members", "news"];
const FALLBACK_LIMIT = 6;

export const PINS_NOT_SAVED = "Couldn't save your Pinned Pages";

const PIN_KEYS = new Set<string>([
  ...CLUB_PAGES.map((p) => p.key),
  ...Object.values(STAFF_PAGE).map((p) => p.key),
]);

// What the session says about the member's list beside the list itself.
export interface PinRules {
  // The most pins a member may keep, counting the ones they can't see now.
  limit: number;
  // How many visible pins the member has room for: the limit less the pins
  // they can't see right now, which a save keeps and the limit counts.
  room: number;
  // The club default, in order, that a member follows until they save.
  clubDefault: readonly string[];
}

type PinSession = Pick<AppSession, "pinned_pages_limit" | "pinned_pages_room" | "pinned_pages_default">;

// The session's rules; an older API that doesn't send them gets the
// website's fallback, with no hidden pins counted.
export function pinRules(session: PinSession): PinRules {
  const limit = session.pinned_pages_limit ?? FALLBACK_LIMIT;
  return {
    limit,
    room: Math.min(session.pinned_pages_room ?? limit, limit),
    clubDefault: session.pinned_pages_default ?? FALLBACK_DEFAULT,
  };
}

// The session's list; an API without Pinned Pages yet sends none, and then
// everyone has the club default.
export function memberPins(sessionPins: readonly string[] | undefined, rules: PinRules): readonly string[] {
  return sessionPins ?? rules.clubDefault;
}

// Whether the member saved their own list (Settings offers a reset then).
// An API that doesn't say reads as following the club default.
export function pinsCustomised(session: Pick<AppSession, "pinned_pages_customised">): boolean {
  return session.pinned_pages_customised === true;
}

// The club default's pages by name, in order: "Voting, Games, Members and
// News".
export function clubDefaultNames(keys: readonly string[]): string {
  const names = keys.map((key) => CLUB_PAGES.find((p) => p.key === key)?.label ?? key);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names.join("");
}

// Whether the visible list has no room for another pin.
export function pinsFull(keys: readonly string[], rules: PinRules): boolean {
  return keys.length >= rules.room;
}

// Why a pin is refused: the list is full, counting any pins the member
// can't see right now.
export function pinsFullMessage(rules: PinRules): string {
  const hidden = rules.limit - rules.room;
  const counting = hidden > 0 ? `, ${hidden} of them hidden right now` : "";
  return `Pinned list full (${rules.limit}${counting}). Unpin one first.`;
}

// The failed save's notice: the API's reason when it gave one (a refused
// list), else the plain message.
export function notSavedMessage(reason: string | null): string {
  const why = reason ? `: ${reason.replace(/\.$/, "")}` : "";
  return `${PINS_NOT_SAVED}${why}. Your sidebar is back as it was.`;
}

// The list with `key` unpinned, or pinned at the bottom; null when pinning
// would pass the limit (nothing is dropped to make room).
export function togglePin(keys: readonly string[], key: string, rules: PinRules): string[] | null {
  if (keys.includes(key)) return keys.filter((k) => k !== key);
  if (pinsFull(keys, rules)) return null;
  return [...keys, key];
}

// A list a member may send: page keys the website knows.
export function isPinKeyList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((k) => typeof k === "string" && PIN_KEYS.has(k));
}

// The list after a drag reordered the rows the sidebar draws (`order`):
// those pages take their places in the new order, and any key the sidebar
// doesn't draw stays where it was. Null when nothing moved.
export function reorderPins(keys: readonly string[], order: readonly string[]): string[] | null {
  const queue = [...order];
  const next = keys.map((k) => (order.includes(k) ? (queue.shift() ?? k) : k));
  return next.every((k, i) => k === keys[i]) ? null : next;
}

// What a page's row menu can do (www#136 on touch, www#137 by keyboard).
// Pinned rows reorder by dragging (hooks/use-sortable), not from the menu.
export type PageMenuAction = "pin" | "unpin";

export interface PageMenuItem {
  action: PageMenuAction;
  label: string;
  disabled: boolean;
  // Why a disabled item can't be used, said under it (touch has no tooltip).
  hint?: string;
}

// The items of a row's menu, for the member's visible list `keys`: Unpin
// while the page is pinned, else Pin to sidebar, disabled once there is no
// room with the full-list message.
export function pageMenuItems(keys: readonly string[], key: string, rules: PinRules): PageMenuItem[] {
  if (keys.includes(key)) return [{ action: "unpin", label: "Unpin", disabled: false }];
  const full = pinsFull(keys, rules);
  return [{ action: "pin", label: "Pin to sidebar", disabled: full, ...(full && { hint: pinsFullMessage(rules) }) }];
}
