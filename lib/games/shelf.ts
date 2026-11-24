import type { GameCollection, GameCompletion, UserBacklog, UserFavorite, UserNowPlaying } from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { dayOf, shortDay } from "@/lib/shelf-forms/dates";
import { historyDay } from "@/lib/shelf-forms/history";

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
  // Backlog and Collection may hold the game more than once (another
  // platform or copy: the API's keys include platform / ownership), in the
  // API's order. Now Playing and Favorites hold it at most once.
  backlog: UserBacklog[];
  // Its place on the member's Favorites ("No. 2 of 10").
  favorite: { entry: UserFavorite; rank: number; of: number } | null;
  collection: GameCollection[];
}

// The lists that can hold one game more than once.
export type MultiList = "backlog" | "collection";
export const isMultiList = (list: ShelfList): list is MultiList => list === "backlog" || list === "collection";

// The lists the viewer is shown (by their Features). Favorites belong to no
// Feature, so they are always shown.
export type ShelfShown = Record<ShelfList, boolean>;

export const EMPTY_SHELF: GameShelf = { nowPlaying: null, completions: [], backlog: [], favorite: null, collection: [] };

export function isOnList(shelf: GameShelf, list: ShelfList): boolean {
  switch (list) {
    case "now_playing":
      return shelf.nowPlaying != null;
    case "completed":
      return shelf.completions.length > 0;
    case "backlog":
      return shelf.backlog.length > 0;
    case "favorite":
      return shelf.favorite != null;
    case "collection":
      return shelf.collection.length > 0;
  }
}

// The shelf with one entry taken off (a removal held behind Undo): the one
// with `entryId` on Completed, Backlog or Collection, the only one elsewhere.
export function withoutEntry(shelf: GameShelf, list: ShelfList, entryId: number): GameShelf {
  switch (list) {
    case "completed":
      return { ...shelf, completions: shelf.completions.filter((e) => e.completion_id !== entryId) };
    case "now_playing":
      return { ...shelf, nowPlaying: null };
    case "favorite":
      return { ...shelf, favorite: null };
    case "backlog":
      return { ...shelf, backlog: shelf.backlog.filter((e) => resolveEntryId("backlog", e) !== entryId) };
    case "collection":
      return { ...shelf, collection: shelf.collection.filter((e) => resolveEntryId("collection", e) !== entryId) };
  }
}

// What pressing a list's row (or the main side) does: add the game, edit its
// entry, or log a Game Completion.
export type ShelfMode = "add" | "edit" | "log";

export interface ShelfStep {
  list: ShelfList;
  mode: ShelfMode;
  label: string;
  // The Game Completion, Backlog or Collection entry an "edit" opens.
  entryId?: number;
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
  const step: ShelfStep = { list: on, mode: "edit", label: `Edit ${SHELF_TITLES[on]}` };
  if (isMultiList(on)) step.entryId = resolveEntryId(on, shelf[on][0]);
  return step;
}

export interface ShelfRow {
  // Unique per row: the list, or "<list>:<entry id>" / "<list>:add" for a
  // Backlog or Collection holding the game more than once.
  key: string;
  list: ShelfList;
  title: string;
  on: boolean;
  // "Since 9 Nov · Switch", "Once · last 14 Mar 2019", "Not on it".
  state: string;
  mode: ShelfMode;
  // The row's own verb: "Edit", "Add", "Add another", "Log another", "Log one".
  action: string;
  // The Game Completion, Backlog or Collection entry an "edit" row opens.
  entryId?: number;
}

type PlatformName = (platformId: number | null | undefined) => string | null;

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");

function onState(shelf: GameShelf, list: "now_playing" | "favorite", platform: PlatformName): string {
  switch (list) {
    case "now_playing": {
      const day = dayOf(shelf.nowPlaying?.added_at);
      return join(day ? `Since ${shortDay(day)}` : "Playing", platform(shelf.nowPlaying?.platform_id));
    }
    case "favorite":
      // rank 0: its place couldn't be read.
      return shelf.favorite?.rank ? `No. ${shelf.favorite.rank} of ${shelf.favorite.of}` : "On your Favorites";
  }
}

function entryState(list: MultiList, entry: UserBacklog | GameCollection, platform: PlatformName): string {
  if (list === "backlog") return join("Queued", platform(entry.platform_id));
  return join((entry as GameCollection).ownership_type, platform(entry.platform_id)) || "Collected";
}

const ANOTHER_STATE: Record<MultiList, string> = {
  backlog: "Another platform",
  collection: "Another copy or platform",
};

// The member's Game Completions of the game as menu rows, newest first,
// each opening its own run to edit or remove: "14 Mar 2019 · Main Story · PS2".
function completionRows(completions: readonly GameCompletion[], platform: PlatformName): ShelfRow[] {
  return [...completions]
    .sort((a, b) => (dayOf(b.completed_at) ?? "").localeCompare(dayOf(a.completed_at) ?? "") || b.completion_id - a.completion_id)
    .map((c) => ({
      key: `completed:${c.completion_id}`,
      list: "completed",
      title: SHELF_TITLES.completed,
      on: true,
      state: join(historyDay(dayOf(c.completed_at)), c.completion_type, platform(c.platform_id)),
      mode: "edit",
      action: "Edit",
      entryId: c.completion_id,
    }));
}

// The menu's rows, in its order, for the lists the viewer is shown: one per
// list, except a list holding the game more than once (Game Completions,
// Backlog, Collection), which gets a row per entry (to edit) and a row to
// add another.
export function shelfRows(shelf: GameShelf, shown: ShelfShown, platform: PlatformName = () => null): ShelfRow[] {
  return SHELF_LISTS.filter((list) => shown[list]).flatMap((list): ShelfRow[] => {
    const on = isOnList(shelf, list);
    const title = SHELF_TITLES[list];
    if (!on) {
      return [{ key: list, list, title, on, state: "Not on it", mode: list === "completed" ? "log" : "add", action: list === "completed" ? "Log one" : "Add" }];
    }
    if (list === "completed") {
      return [
        ...completionRows(shelf.completions, platform),
        { key: "completed:log", list, title, on: false, state: "Another run", mode: "log", action: "Log another" },
      ];
    }
    if (isMultiList(list)) {
      const entries = shelf[list] as (UserBacklog | GameCollection)[];
      return [
        ...entries.map((entry): ShelfRow => {
          const entryId = resolveEntryId(list, entry);
          return { key: `${list}:${entryId}`, list, title, on, state: entryState(list, entry, platform), mode: "edit", action: "Edit", entryId };
        }),
        { key: `${list}:add`, list, title, on: false, state: ANOTHER_STATE[list], mode: "add", action: "Add another" },
      ];
    }
    const state = onState(shelf, list, platform);
    return [{ key: list, list, title, on, state, mode: "edit", action: "Edit" }];
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
  const times = (n: number) => (n > 1 ? { figure: `×${n}` } : {});
  if (shown.backlog && shelf.backlog.length > 0) chips.push({ list: "backlog", label: "In Backlog", ...times(shelf.backlog.length) });
  if (shown.favorite && shelf.favorite) {
    chips.push({ list: "favorite", label: "Favorite", ...(shelf.favorite.rank ? { figure: `No. ${shelf.favorite.rank}` } : {}) });
  }
  if (shown.collection && shelf.collection.length > 0) {
    const [first] = shelf.collection;
    const label = shelf.collection.length > 1 ? "Collected" : first.ownership_type || "Collected";
    chips.push({ list: "collection", label, ...times(shelf.collection.length) });
  }
  return chips;
}
