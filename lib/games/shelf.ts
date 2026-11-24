import type { GameCollection, GameCompletion, UserBacklog, UserFavorite, UserNowPlaying } from "@/lib/api/types";
import { dayOf, longDay, shortDay } from "@/lib/shelf-forms/dates";

// Where a signed-in member's lists stand on one game, as the game page's
// split button reads them (spec api#451, design 1A): the next step on its
// main side, a row per list in its caret menu, and the state chips beside it.

export type ShelfList = "now_playing" | "completed" | "backlog" | "favorite" | "collection";

// The lists in the menu's order.
export const SHELF_LISTS: readonly ShelfList[] = ["now_playing", "completed", "backlog", "favorite", "collection"];

export const SHELF_TITLES: Record<ShelfList, string> = {
  now_playing: "Now Playing",
  completed: "Completed",
  backlog: "Backlog",
  favorite: "Favorites",
  collection: "Collection",
};

// The profile list page of each list, under /members/:id.
export const SHELF_ROUTES: Record<ShelfList, string> = {
  now_playing: "now-playing-games",
  completed: "completed-games",
  backlog: "backlogged-games",
  favorite: "favorite-games",
  collection: "collected-games",
};

export interface GameShelf {
  nowPlaying: UserNowPlaying | null;
  // Oldest first or any order; the newest dated one is "last".
  completions: GameCompletion[];
  backlog: UserBacklog | null;
  // Its place on the member's Favorites ("No. 2 of 10").
  favorite: { entry: UserFavorite; rank: number; of: number } | null;
  collection: GameCollection | null;
}

// The lists the viewer is shown (by their Features). Favorites belong to no
// Feature, so they are always shown.
export type ShelfShown = Record<ShelfList, boolean>;

export const EMPTY_SHELF: GameShelf = { nowPlaying: null, completions: [], backlog: null, favorite: null, collection: null };

export function isOnList(shelf: GameShelf, list: ShelfList): boolean {
  switch (list) {
    case "now_playing":
      return shelf.nowPlaying != null;
    case "completed":
      return shelf.completions.length > 0;
    case "backlog":
      return shelf.backlog != null;
    case "favorite":
      return shelf.favorite != null;
    case "collection":
      return shelf.collection != null;
  }
}

// The shelf with one list's entry taken off (a removal held behind Undo).
export function withoutList(shelf: GameShelf, list: Exclude<ShelfList, "completed">): GameShelf {
  const key = ({ now_playing: "nowPlaying", backlog: "backlog", favorite: "favorite", collection: "collection" } as const)[list];
  return { ...shelf, [key]: null };
}

// What pressing a list's row (or the main side) does: add the game, edit its
// entry, or log a Game Completion.
export type ShelfMode = "add" | "edit" | "log";

export interface ShelfStep {
  list: ShelfList;
  mode: ShelfMode;
  label: string;
}

const ADD_LABEL: Record<Exclude<ShelfList, "completed">, string> = {
  now_playing: "Start playing",
  backlog: "Add to Backlog",
  favorite: "Add to Favorites",
  collection: "Add to Collection",
};

/**
 * The split button's main side: the likely next step for this game. Playing
 * it: Log a completion. Finished it before: Log another completion. Neither:
 * Start playing. A list the viewer isn't shown is never offered; with Now
 * Playing and Game Completions both hidden it falls back to the first other
 * list the game isn't on, then to editing the first it is on.
 */
export function nextStep(shelf: GameShelf, shown: ShelfShown): ShelfStep {
  const playing = shown.now_playing && shelf.nowPlaying != null;
  if (shown.completed && playing) return { list: "completed", mode: "log", label: "Log a completion" };
  if (shown.completed && shelf.completions.length > 0) {
    return { list: "completed", mode: "log", label: "Log another completion" };
  }
  if (shown.now_playing && !playing) return { list: "now_playing", mode: "add", label: ADD_LABEL.now_playing };
  if (shown.completed) return { list: "completed", mode: "log", label: "Log a completion" };
  const others = (["backlog", "favorite", "collection"] as const).filter((list) => shown[list]);
  const off = others.find((list) => !isOnList(shelf, list));
  if (off) return { list: off, mode: "add", label: ADD_LABEL[off] };
  const on = (["now_playing", ...others] as const).find((list) => shown[list] && isOnList(shelf, list)) ?? "favorite";
  return { list: on, mode: "edit", label: `Edit ${SHELF_TITLES[on]}` };
}

export interface ShelfRow {
  list: ShelfList;
  title: string;
  on: boolean;
  // "Since 9 Nov · Switch", "Once · last 14 Mar 2019", "Not on it".
  state: string;
  mode: ShelfMode;
  // The row's own verb: "Edit", "Add", "Log another", "Log one".
  action: string;
}

type PlatformName = (platformId: number | null | undefined) => string | null;

function completedState(completions: readonly GameCompletion[]): string {
  const count = completions.length;
  const times = count === 1 ? "Once" : count === 2 ? "Twice" : `${count} times`;
  const days = completions.map((c) => dayOf(c.completed_at)).filter((d): d is string => d != null).sort();
  const last = days.at(-1);
  return last ? `${times} · last ${longDay(last).slice(4)}` : times;
}

function onState(shelf: GameShelf, list: ShelfList, platform: PlatformName): string {
  const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");
  switch (list) {
    case "now_playing": {
      const day = dayOf(shelf.nowPlaying?.added_at);
      return join(day ? `Since ${shortDay(day)}` : "Playing", platform(shelf.nowPlaying?.platform_id));
    }
    case "completed":
      return completedState(shelf.completions);
    case "backlog":
      return join("Queued", platform(shelf.backlog?.platform_id));
    case "favorite":
      return `No. ${shelf.favorite?.rank} of ${shelf.favorite?.of}`;
    case "collection":
      return join(shelf.collection?.ownership_type, platform(shelf.collection?.platform_id));
  }
}

// One row per list the viewer is shown, in the menu's order.
export function shelfRows(shelf: GameShelf, shown: ShelfShown, platform: PlatformName = () => null): ShelfRow[] {
  return SHELF_LISTS.filter((list) => shown[list]).map((list) => {
    const on = isOnList(shelf, list);
    const base = { list, title: SHELF_TITLES[list], on, state: on ? onState(shelf, list, platform) : "Not on it" };
    if (list === "completed") return { ...base, mode: "log", action: on ? "Log another" : "Log one" };
    return { ...base, mode: on ? "edit" : "add", action: on ? "Edit" : "Add" };
  });
}

export interface ShelfChip {
  list: ShelfList;
  label: string;
  // A figure set big beside the label ("×2", "No. 2").
  figure?: string;
}

// The chips beside the split button: where the game already is.
export function shelfChips(shelf: GameShelf, shown: ShelfShown): ShelfChip[] {
  const chips: ShelfChip[] = [];
  if (shown.now_playing && shelf.nowPlaying) {
    const day = dayOf(shelf.nowPlaying.added_at);
    chips.push({ list: "now_playing", label: day ? `Playing since ${shortDay(day)}` : "Playing" });
  }
  if (shown.completed && shelf.completions.length > 0) {
    chips.push({ list: "completed", label: "Completed", figure: `×${shelf.completions.length}` });
  }
  if (shown.backlog && shelf.backlog) chips.push({ list: "backlog", label: "In Backlog" });
  if (shown.favorite && shelf.favorite) chips.push({ list: "favorite", label: "Favorite", figure: `No. ${shelf.favorite.rank}` });
  if (shown.collection && shelf.collection) {
    chips.push({ list: "collection", label: shelf.collection.ownership_type || "Collected" });
  }
  return chips;
}
