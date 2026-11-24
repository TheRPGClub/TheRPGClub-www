import { describe, expect, it } from "vitest";

import { entryForGame, isOrderedKind, liftLine, listPosition, ordinal } from "./manage";

describe("ordinal", () => {
  it("names a place", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal)).toEqual([
      "1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "23rd", "101st", "111th",
    ]);
  });
});

describe("liftLine", () => {
  it("says where a lifted entry goes", () => {
    expect(liftLine(4, 2)).toBe("from 4th to 2nd");
    expect(liftLine(3, 3)).toBe("at 3rd");
  });
});

describe("listPosition", () => {
  it("counts across pages from 1", () => {
    expect(listPosition(0, 0)).toBe(1);
    expect(listPosition(24, 2)).toBe(27);
  });
});

describe("isOrderedKind", () => {
  it("is true for Now Playing, Backlog and Favorites only", () => {
    expect(isOrderedKind("now_playing")).toBe(true);
    expect(isOrderedKind("backlog")).toBe(true);
    expect(isOrderedKind("favorite")).toBe(true);
    expect(isOrderedKind("completed")).toBe(false);
    expect(isOrderedKind("collection")).toBe(false);
  });
});

describe("entryForGame", () => {
  it("finds the page's entry for a game by its game or its id", () => {
    const entries = [
      { entry_id: 1, game: { game_id: 7 } },
      { entry_id: 2, game: null, gamedb_game_id: 9 },
    ];
    expect(entryForGame(entries, 7)?.entry_id).toBe(1);
    expect(entryForGame(entries, 9)?.entry_id).toBe(2);
    expect(entryForGame(entries, 3)).toBeUndefined();
  });
});
