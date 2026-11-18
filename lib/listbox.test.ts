import { describe, expect, it } from "vitest";

import { listboxKey } from "./listbox";

describe("listboxKey", () => {
  it("closes on Escape, even with nothing listed", () => {
    expect(listboxKey("Escape", 0, 0, ["Enter"])).toEqual({ action: "close" });
  });

  it("moves round the list with the arrows", () => {
    expect(listboxKey("ArrowDown", 2, 3, ["Enter"])).toEqual({ action: "move", index: 0 });
    expect(listboxKey("ArrowUp", 0, 3, ["Enter"])).toEqual({ action: "move", index: 2 });
  });

  it("picks the lit choice with a pick key, within the list", () => {
    expect(listboxKey("Tab", 5, 3, ["Enter", "Tab"])).toEqual({ action: "pick", index: 2 });
    expect(listboxKey("Tab", 0, 3, ["Enter"])).toBeNull();
  });

  it("leaves every other key, and every key but Escape on an empty list, to the field", () => {
    expect(listboxKey("a", 0, 3, ["Enter"])).toBeNull();
    expect(listboxKey("Enter", 0, 0, ["Enter"])).toBeNull();
  });
});
