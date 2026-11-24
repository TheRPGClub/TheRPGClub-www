import { describe, expect, it } from "vitest";

import { moveItem, nudge } from "./reorder";

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
