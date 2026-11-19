import { describe, expect, it } from "vitest";

import {
  PINS_FULL,
  PIN_LIMIT,
  clubDefaultNames,
  isPinKeyList,
  memberPins,
  movePin,
  pageMenuItems,
  placePin,
  pinsCustomised,
  pinsFull,
  togglePin,
} from "@/lib/pinned-pages";

describe("memberPins", () => {
  it("takes the session's Pinned Pages", () => {
    expect(memberPins(["news", "releases"])).toEqual(["news", "releases"]);
  });

  it("keeps an empty list empty", () => {
    expect(memberPins([])).toEqual([]);
  });

  it("falls back to the club default when the API sends none", () => {
    expect(memberPins(undefined)).toEqual(["voting", "games", "members", "news"]);
  });
});

describe("togglePin", () => {
  it("adds a new pin at the bottom", () => {
    expect(togglePin(["voting", "games"], "news")).toEqual(["voting", "games", "news"]);
  });

  it("removes a pinned page and keeps the others' order", () => {
    expect(togglePin(["voting", "games", "news"], "games")).toEqual(["voting", "news"]);
  });

  it("refuses a seventh pin, dropping nothing", () => {
    const six = ["voting", "games", "members", "news", "codex", "releases"];
    expect(PIN_LIMIT).toBe(6);
    expect(pinsFull(six)).toBe(true);
    expect(togglePin(six, "journals")).toBeNull();
  });

  it("still unpins from a full list", () => {
    const six = ["voting", "games", "members", "news", "codex", "releases"];
    expect(togglePin(six, "codex")).toEqual(["voting", "games", "members", "news", "releases"]);
  });
});

describe("isPinKeyList", () => {
  it("accepts known page keys, staff ones too", () => {
    expect(isPinKeyList(["voting", "staff_desk", "suggestion_review"])).toBe(true);
    expect(isPinKeyList([])).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isPinKeyList(["dashboard"])).toBe(false);
    expect(isPinKeyList("voting")).toBe(false);
    expect(isPinKeyList([1])).toBe(false);
  });
});

describe("pageMenuItems", () => {
  it("offers Pin to sidebar for an unpinned page", () => {
    expect(pageMenuItems(["voting"], "games")).toEqual([
      { action: "pin", label: "Pin to sidebar", disabled: false },
    ]);
  });

  it("offers Unpin for a pinned page", () => {
    expect(pageMenuItems(["voting", "games"], "games")).toEqual([
      { action: "unpin", label: "Unpin", disabled: false },
    ]);
  });

  it("disables Pin to sidebar at the limit and says why", () => {
    const full = ["voting", "games", "members", "news", "releases", "achievements"];
    expect(full).toHaveLength(PIN_LIMIT);
    expect(pageMenuItems(full, "challenges")).toEqual([
      { action: "pin", label: "Pin to sidebar", disabled: true, hint: PINS_FULL },
    ]);
  });

  it("still offers Unpin at the limit", () => {
    const full = ["voting", "games", "members", "news", "releases", "achievements"];
    expect(pageMenuItems(full, "news")[0]).toMatchObject({ action: "unpin", disabled: false });
  });
});

describe("pageMenuItems on a Pinned row", () => {
  const keys = ["voting", "games", "news"];

  it("adds Move up and Move down after Unpin", () => {
    expect(pageMenuItems(keys, "games", { reorder: true })).toEqual([
      { action: "unpin", label: "Unpin", disabled: false },
      { action: "move-up", label: "Move up", disabled: false },
      { action: "move-down", label: "Move down", disabled: false },
    ]);
  });

  it("disables Move up on the first row and Move down on the last", () => {
    const first = pageMenuItems(keys, "voting", { reorder: true });
    const last = pageMenuItems(keys, "news", { reorder: true });
    expect(first.find((i) => i.action === "move-up")?.disabled).toBe(true);
    expect(first.find((i) => i.action === "move-down")?.disabled).toBe(false);
    expect(last.find((i) => i.action === "move-up")?.disabled).toBe(false);
    expect(last.find((i) => i.action === "move-down")?.disabled).toBe(true);
  });

  it("disables both on a lone pin", () => {
    const items = pageMenuItems(["news"], "news", { reorder: true });
    expect(items.filter((i) => i.disabled).map((i) => i.action)).toEqual(["move-up", "move-down"]);
  });

  it("offers no moves on a group's entry, pinned or not", () => {
    expect(pageMenuItems(keys, "games").map((i) => i.action)).toEqual(["unpin"]);
    expect(pageMenuItems(keys, "codex", { reorder: true }).map((i) => i.action)).toEqual(["pin"]);
  });
});

describe("movePin", () => {
  const keys = ["voting", "games", "news"];

  it("moves a pin up or down one place", () => {
    expect(movePin(keys, "games", -1)).toEqual(["games", "voting", "news"]);
    expect(movePin(keys, "games", 1)).toEqual(["voting", "news", "games"]);
  });

  it("refuses to move past either end", () => {
    expect(movePin(keys, "voting", -1)).toBeNull();
    expect(movePin(keys, "news", 1)).toBeNull();
  });

  it("refuses a page that isn't pinned", () => {
    expect(movePin(keys, "codex", 1)).toBeNull();
  });
});

describe("placePin", () => {
  const keys = ["voting", "games", "members", "news"];

  it("drops a pin before another, either way", () => {
    expect(placePin(keys, "news", "games")).toEqual(["voting", "news", "games", "members"]);
    expect(placePin(keys, "voting", "news")).toEqual(["games", "members", "voting", "news"]);
  });

  it("drops a pin at the bottom", () => {
    expect(placePin(keys, "voting", null)).toEqual(["games", "members", "news", "voting"]);
  });

  it("says nothing changed when the pin lands where it was", () => {
    expect(placePin(keys, "games", "members")).toBeNull();
    expect(placePin(keys, "games", "games")).toBeNull();
    expect(placePin(keys, "news", null)).toBeNull();
  });

  it("refuses pages that aren't pinned", () => {
    expect(placePin(keys, "codex", "games")).toBeNull();
    expect(placePin(keys, "games", "codex")).toBeNull();
  });
});

describe("pinsCustomised", () => {
  it("is true when the session says the member saved their own list", () => {
    expect(pinsCustomised({ pinned_pages_customised: true })).toBe(true);
  });

  it("is false while the member follows the club default", () => {
    expect(pinsCustomised({ pinned_pages_customised: false })).toBe(false);
  });

  it("is false when the API doesn't say, so there is nothing to reset", () => {
    expect(pinsCustomised({})).toBe(false);
  });
});

describe("clubDefaultNames", () => {
  it("names the club default's pages in order", () => {
    expect(clubDefaultNames()).toBe("Voting, Games, Members and News");
  });
});
