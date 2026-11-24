// The owner's manage mode on a profile list page (spec api#451, pick 3A):
// the small sums its tools say out loud.

import { ORDERED_KINDS } from "./reorder";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";

// 1st, 2nd, 3rd, 4th ... 11th, 12th, 13th, 21st.
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  const suffix = ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

// Where a lifted entry is going, for the lift bar ("from 4th to 2nd").
export function liftLine(from: number, to: number): string {
  return from === to ? `at ${ordinal(from)}` : `from ${ordinal(from)} to ${ordinal(to)}`;
}

// An entry's place in the whole list (1 first), from its index on a page.
export function listPosition(offset: number, index: number): number {
  return offset + index + 1;
}

export function isOrderedKind(kind: MemberShelfKind): kind is (typeof ORDERED_KINDS)[number] {
  return (ORDERED_KINDS as readonly string[]).includes(kind);
}

// The lists that may hold one game more than once (another platform or
// copy: the API's keys include platform / ownership).
const REPEATABLE: readonly MemberShelfKind[] = ["backlog", "collection"];

export type AddPick = { action: "add" } | { action: "open"; entryId: number; undoRemoval: boolean };

// What picking a game in a list page's add search does. Backlog and
// Collection always add (another entry for the game is fine). Now Playing
// and Favorites open the game's entry instead of a refused add; one whose
// removal is held behind Undo is put back and opened, and one already
// removed counts as gone (so the game is added again).
export function addPick<T extends { game?: { game_id: number } | null; gamedb_game_id?: number | null }>(
  kind: MemberShelfKind,
  entries: readonly T[],
  gameId: number,
  idOf: (entry: T) => number | null | undefined,
  removal: { held: ReadonlySet<number>; gone: ReadonlySet<number> },
): AddPick {
  if (REPEATABLE.includes(kind)) return { action: "add" };
  const listed = entries.find((entry) => {
    const id = idOf(entry);
    return id != null && !removal.gone.has(id) && (entry.game?.game_id ?? entry.gamedb_game_id) === gameId;
  });
  const entryId = listed && idOf(listed);
  if (entryId == null) return { action: "add" };
  return { action: "open", entryId, undoRemoval: removal.held.has(entryId) };
}
