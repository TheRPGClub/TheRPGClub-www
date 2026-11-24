import { describe, expect, it } from "vitest";
import {
  leadWith,
  matchLists,
  moveEntry,
  placeEntry,
  placeOf,
  reorderEntries,
  sortEntries,
} from "@/lib/game-lists/order";
import type { GameList, GameListEntry } from "@/lib/game-lists/types";

const entry = (game_id: number, title: string, position: number, added_at: string): GameListEntry => ({
  game_id,
  position,
  note: null,
  added_at,
  game: { game_id, title, cover_url: null },
});

const ENTRIES = [
  entry(1, "chrono Trigger", 2, "2026-01-02T00:00:00Z"),
  entry(2, "Final Fantasy VI", 1, "2026-03-01T00:00:00Z"),
  entry(3, "Bloodborne", 3, "2026-03-01T00:00:00Z"),
  entry(4, "Disco Elysium", 4, "2025-12-31T00:00:00Z"),
];
const ids = (list: GameListEntry[]) => list.map((e) => e.game_id);

describe("sortEntries", () => {
  it("ranks by position", () => {
    expect(ids(sortEntries(ENTRIES, "ranked"))).toEqual([2, 1, 3, 4]);
  });
  it("sorts A to Z ignoring case", () => {
    expect(ids(sortEntries(ENTRIES, "alphabetical"))).toEqual([3, 1, 4, 2]);
  });
  it("puts the newest first, ties by position", () => {
    expect(ids(sortEntries(ENTRIES, "added"))).toEqual([2, 3, 1, 4]);
  });
  it("leaves its input alone", () => {
    sortEntries(ENTRIES, "alphabetical");
    expect(ids(ENTRIES)).toEqual([1, 2, 3, 4]);
  });
});

describe("moveEntry", () => {
  it("swaps a game with its neighbour", () => {
    expect(moveEntry([1, 2, 3], 2, -1)).toEqual([2, 1, 3]);
    expect(moveEntry([1, 2, 3], 2, 1)).toEqual([1, 3, 2]);
  });
  it("refuses past either end or for an unknown game", () => {
    expect(moveEntry([1, 2, 3], 1, -1)).toBeNull();
    expect(moveEntry([1, 2, 3], 3, 1)).toBeNull();
    expect(moveEntry([1, 2, 3], 9, 1)).toBeNull();
  });
});

describe("placeEntry", () => {
  it("drops a game before another", () => {
    expect(placeEntry([1, 2, 3, 4], 4, 2)).toEqual([1, 4, 2, 3]);
    expect(placeEntry([1, 2, 3, 4], 1, 4)).toEqual([2, 3, 1, 4]);
  });
  it("drops a game at the end", () => {
    expect(placeEntry([1, 2, 3], 1, null)).toEqual([2, 3, 1]);
  });
  it("is null when nothing changes", () => {
    expect(placeEntry([1, 2, 3], 2, 3)).toBeNull();
    expect(placeEntry([1, 2, 3], 3, null)).toBeNull();
    expect(placeEntry([1, 2, 3], 2, 2)).toBeNull();
  });
});

describe("reorderEntries", () => {
  it("renumbers positions to the new order", () => {
    const next = reorderEntries(ENTRIES, [4, 3, 2, 1]);
    expect(next.map((e) => [e.game_id, e.position])).toEqual([[4, 1], [3, 2], [2, 3], [1, 4]]);
  });
});

describe("placeOf", () => {
  const ten = Array.from({ length: 10 }, (_, i) => entry(i + 1, `G${i + 1}`, i + 1, "2026-01-01T00:00:00Z"));
  it("finds the game's place with its neighbours centred", () => {
    const place = placeOf(ten, 6);
    expect(place?.place).toBe(6);
    expect(place?.of).toBe(10);
    expect(place?.neighbours.map((g) => g.game_id)).toEqual([4, 5, 6, 7, 8]);
  });
  it("keeps five covers at the ends", () => {
    expect(placeOf(ten, 1)?.neighbours.map((g) => g.game_id)).toEqual([1, 2, 3, 4, 5]);
    expect(placeOf(ten, 10)?.neighbours.map((g) => g.game_id)).toEqual([6, 7, 8, 9, 10]);
  });
  it("is null for a game not in the list", () => {
    expect(placeOf(ten, 99)).toBeNull();
  });
});

const list = (id: number, name: string, owner: string | null): GameList =>
  ({
    id,
    name,
    club: owner === null,
    owner: owner ? { user_id: String(id), username: owner.toLowerCase(), global_name: owner, avatar_url: "" } : null,
  }) as GameList;

describe("matchLists", () => {
  const LISTS = [list(1, "Top 10 of all time", "Mara"), list(2, "Soulslike", "Grindlord"), list(3, "Club canon", null)];
  it("matches the name or the owner, any case", () => {
    expect(matchLists(LISTS, "SOULS").map((l) => l.id)).toEqual([2]);
    expect(matchLists(LISTS, "mara").map((l) => l.id)).toEqual([1]);
    expect(matchLists(LISTS, "grindlord souls").map((l) => l.id)).toEqual([2]);
  });
  it("finds the club's lists by 'club' and keeps all for a blank query", () => {
    expect(matchLists(LISTS, "club").map((l) => l.id)).toEqual([3]);
    expect(matchLists(LISTS, "  ")).toHaveLength(3);
  });
});

describe("leadWith", () => {
  it("moves the searched game to the front", () => {
    const games = ENTRIES.map((e) => e.game);
    expect(leadWith(games, 3).map((g) => g.game_id)).toEqual([3, 1, 2, 4]);
    expect(leadWith(games, null).map((g) => g.game_id)).toEqual([1, 2, 3, 4]);
  });
});
