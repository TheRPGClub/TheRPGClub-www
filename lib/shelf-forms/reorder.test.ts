import { describe, expect, it } from "vitest";

import { moveItem, nudge, sortOrderPatches } from "./reorder";

describe("moveItem", () => {
  it("moves an item and clamps the target", () => {
    expect(moveItem(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
    expect(moveItem(["a", "b", "c"], 0, 9)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"]);
  });
});

describe("nudge", () => {
  it("moves one step Earlier or Later, and not past either end", () => {
    expect(nudge(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(nudge(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
    expect(nudge(["a", "b", "c"], 0, -1)).toBeNull();
    expect(nudge(["a", "b", "c"], 2, 1)).toBeNull();
  });
});

describe("sortOrderPatches", () => {
  it("renumbers every entry when the stored orders aren't known", () => {
    expect(sortOrderPatches([12, 10, 11])).toEqual([
      { entryId: 12, sortOrder: 1 },
      { entryId: 10, sortOrder: 2 },
      { entryId: 11, sortOrder: 3 },
    ]);
  });

  it("writes only the moved entries when the list is already numbered 1..n", () => {
    const before = [
      { entryId: 10, sortOrder: 1 },
      { entryId: 11, sortOrder: 2 },
      { entryId: 12, sortOrder: 3 },
    ];
    expect(sortOrderPatches([11, 10, 12], before)).toEqual([
      { entryId: 11, sortOrder: 1 },
      { entryId: 10, sortOrder: 2 },
    ]);
  });

  it("renumbers all when the stored orders have gaps or nulls", () => {
    const before = [
      { entryId: 10, sortOrder: 5 },
      { entryId: 11, sortOrder: 6 },
      { entryId: 12, sortOrder: null },
    ];
    expect(sortOrderPatches([10, 12, 11], before)).toHaveLength(3);
  });
});
