import { describe, expect, it } from "vitest";

import { addPick, isOrderedKind, liftLine, listPosition, ordinal } from "./manage";

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

describe("addPick", () => {
  const entries = [
    { entry_id: 1, game: { game_id: 7 } },
    { entry_id: 2, game: { game_id: 9 } },
  ];
  const idOf = (e: { entry_id: number }) => e.entry_id;
  const none = { held: new Set<number>(), gone: new Set<number>() };

  it("adds another Backlog or Collection entry for a game already there", () => {
    expect(addPick("backlog", entries, 7, idOf, none)).toEqual({ action: "add" });
    expect(addPick("collection", entries, 7, idOf, none)).toEqual({ action: "add" });
  });

  it("opens the Now Playing or Favorites entry of a game already there", () => {
    expect(addPick("now_playing", entries, 7, idOf, none)).toEqual({ action: "open", entryId: 1, undoRemoval: false });
    expect(addPick("favorite", entries, 9, idOf, none)).toEqual({ action: "open", entryId: 2, undoRemoval: false });
    expect(addPick("favorite", entries, 3, idOf, none)).toEqual({ action: "add" });
  });

  it("puts back and opens an entry whose removal is held behind Undo", () => {
    const removal = { held: new Set([1]), gone: new Set<number>() };
    expect(addPick("now_playing", entries, 7, idOf, removal)).toEqual({ action: "open", entryId: 1, undoRemoval: true });
  });

  it("adds a game whose entry was already removed", () => {
    const removal = { held: new Set<number>(), gone: new Set([1]) };
    expect(addPick("now_playing", entries, 7, idOf, removal)).toEqual({ action: "add" });
  });
});
