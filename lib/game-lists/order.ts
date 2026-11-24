import type { GameList, GameListEntry, GameListGame, GameListSort } from "@/lib/game-lists/types";
import { memberName } from "@/lib/game-lists/types";

// The orders a Game List can be read in and the moves its editor makes, kept
// pure so the page and its tests agree with the API (api#446): Ranked by
// position, A to Z by title ignoring case, Date added newest first; ties
// fall back to the ranked position. Client-safe.

const byPosition = (a: GameListEntry, b: GameListEntry) => a.position - b.position;

export function sortEntries(entries: readonly GameListEntry[], sort: GameListSort): GameListEntry[] {
  const copy = [...entries];
  if (sort === "alphabetical") {
    return copy.sort((a, b) => {
      const at = a.game.title.toLowerCase();
      const bt = b.game.title.toLowerCase();
      return at < bt ? -1 : at > bt ? 1 : byPosition(a, b);
    });
  }
  if (sort === "added") {
    return copy.sort((a, b) => {
      const diff = Date.parse(b.added_at) - Date.parse(a.added_at);
      return diff !== 0 ? diff : byPosition(a, b);
    });
  }
  return copy.sort(byPosition);
}

// The ranked order with one game moved a step up (-1) or down (1); null at
// either end or for a game not in it.
export function moveEntry(ids: readonly number[], id: number, step: -1 | 1): number[] | null {
  const from = ids.indexOf(id);
  const to = from + step;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

// The ranked order with one game dropped before another (null: at the end);
// null when nothing would change.
export function placeEntry(ids: readonly number[], id: number, before: number | null): number[] | null {
  if (!ids.includes(id) || id === before) return null;
  const rest = ids.filter((x) => x !== id);
  const at = before === null ? rest.length : rest.indexOf(before);
  if (at < 0) return null;
  const next = [...rest.slice(0, at), id, ...rest.slice(at)];
  return next.every((x, i) => x === ids[i]) ? null : next;
}

// Entries renumbered to a new ranked order (the ids in that order).
export function reorderEntries(entries: readonly GameListEntry[], ids: readonly number[]): GameListEntry[] {
  const byId = new Map(entries.map((e) => [e.game_id, e]));
  return ids.flatMap((id, i) => {
    const entry = byId.get(id);
    return entry ? [{ ...entry, position: i + 1 }] : [];
  });
}

export interface GamePlace {
  // 1-based, in the list's own order.
  place: number;
  of: number;
  // Up to `around` covers centred on the game, in the list's order.
  neighbours: GameListGame[];
}

// Where a game sits in a list (its entries in the list's own order), with
// the covers either side of it; null when it isn't there.
export function placeOf(entries: readonly GameListEntry[], gameId: number, around = 5): GamePlace | null {
  const i = entries.findIndex((e) => e.game_id === gameId);
  if (i < 0) return null;
  const start = Math.max(0, Math.min(i - Math.floor(around / 2), entries.length - around));
  return {
    place: i + 1,
    of: entries.length,
    neighbours: entries.slice(start, start + around).map((e) => e.game),
  };
}

// The lists whose name or owner's name holds the words (each word, any
// case); the club's lists answer to "club" too.
export function matchLists(lists: readonly GameList[], query: string): GameList[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...lists];
  return lists.filter((list) => {
    const hay = [list.name, memberName(list.owner), list.owner?.username ?? "", list.club ? "club" : ""]
      .join(" ")
      .toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

// A list's covers with one game led to the front (a search by that game).
export function leadWith(games: readonly GameListGame[], gameId: number | null): GameListGame[] {
  if (gameId === null) return [...games];
  const lead = games.find((g) => g.game_id === gameId);
  return lead ? [lead, ...games.filter((g) => g.game_id !== gameId)] : [...games];
}
