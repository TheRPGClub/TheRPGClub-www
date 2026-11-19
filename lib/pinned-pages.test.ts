import { describe, expect, it } from "vitest";

import {
  clubDefaultNames,
  isPinKeyList,
  memberPins,
  movePin,
  notSavedMessage,
  pageMenuItems,
  pinRules,
  pinsFullMessage,
  placePin,
  pinsCustomised,
  pinsFull,
  togglePin,
} from "@/lib/pinned-pages";

// A member with no pins they can't see: room for the whole limit.
const open = { limit: 6, room: 6, clubDefault: ["voting", "games", "members", "news"] };

describe("pinRules", () => {
  it("takes the session's limit, room and club default", () => {
    expect(
      pinRules({ pinned_pages_limit: 8, pinned_pages_room: 5, pinned_pages_default: ["news", "codex"] }),
    ).toEqual({ limit: 8, room: 5, clubDefault: ["news", "codex"] });
  });

  it("falls back to six, all of it room, and Voting, Games, Members and News for an older API", () => {
    expect(pinRules({})).toEqual(open);
  });

  it("gives an older API that sends the limit but no room the whole limit", () => {
    expect(pinRules({ pinned_pages_limit: 4 })).toMatchObject({ limit: 4, room: 4 });
  });
});

describe("memberPins", () => {
  it("takes the session's Pinned Pages", () => {
    expect(memberPins(["news", "releases"], open)).toEqual(["news", "releases"]);
  });

  it("keeps an empty list empty", () => {
    expect(memberPins([], open)).toEqual([]);
  });

  it("falls back to the club default when the API sends none", () => {
    expect(memberPins(undefined, { ...open, clubDefault: ["news", "codex"] })).toEqual(["news", "codex"]);
  });
});

describe("togglePin", () => {
  it("adds a new pin at the bottom", () => {
    expect(togglePin(["voting", "games"], "news", open)).toEqual(["voting", "games", "news"]);
  });

  it("removes a pinned page and keeps the others' order", () => {
    expect(togglePin(["voting", "games", "news"], "games", open)).toEqual(["voting", "news"]);
  });

  it("refuses a seventh pin, dropping nothing", () => {
    const six = ["voting", "games", "members", "news", "codex", "releases"];
    expect(pinsFull(six, open)).toBe(true);
    expect(togglePin(six, "journals", open)).toBeNull();
  });

  it("refuses a pin when the member's hidden pins take the room", () => {
    const four = ["voting", "games", "members", "news"];
    const twoHidden = { ...open, room: 4 };
    expect(pinsFull(four, twoHidden)).toBe(true);
    expect(togglePin(four, "journals", twoHidden)).toBeNull();
    expect(pinsFull(four.slice(1), twoHidden)).toBe(false);
  });

  it("still unpins from a full list", () => {
    const six = ["voting", "games", "members", "news", "codex", "releases"];
    expect(togglePin(six, "codex", open)).toEqual(["voting", "games", "members", "news", "releases"]);
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
    expect(pageMenuItems(["voting"], "games", open)).toEqual([
      { action: "pin", label: "Pin to sidebar", disabled: false },
    ]);
  });

  it("offers Unpin for a pinned page", () => {
    expect(pageMenuItems(["voting", "games"], "games", open)).toEqual([
      { action: "unpin", label: "Unpin", disabled: false },
    ]);
  });

  it("disables Pin to sidebar at the limit and says why", () => {
    const full = ["voting", "games", "members", "news", "releases", "achievements"];
    expect(pageMenuItems(full, "challenges", open)).toEqual([
      { action: "pin", label: "Pin to sidebar", disabled: true, hint: "Pinned list full (6). Unpin one first." },
    ]);
  });

  it("disables Pin to sidebar below six when hidden pins fill the rest, and says so", () => {
    expect(pageMenuItems(["voting", "games", "members", "news", "releases"], "challenges", { ...open, room: 5 })).toEqual([
      {
        action: "pin",
        label: "Pin to sidebar",
        disabled: true,
        hint: "Pinned list full (6, 1 of them hidden right now). Unpin one first.",
      },
    ]);
  });

  it("still offers Unpin at the limit", () => {
    const full = ["voting", "games", "members", "news", "releases", "achievements"];
    expect(pageMenuItems(full, "news", open)[0]).toMatchObject({ action: "unpin", disabled: false });
  });
});

describe("pageMenuItems on a Pinned row", () => {
  const keys = ["voting", "games", "news"];

  it("adds Move up and Move down after Unpin", () => {
    expect(pageMenuItems(keys, "games", open, { reorder: true })).toEqual([
      { action: "unpin", label: "Unpin", disabled: false },
      { action: "move-up", label: "Move up", disabled: false },
      { action: "move-down", label: "Move down", disabled: false },
    ]);
  });

  it("disables Move up on the first row and Move down on the last", () => {
    const first = pageMenuItems(keys, "voting", open, { reorder: true });
    const last = pageMenuItems(keys, "news", open, { reorder: true });
    expect(first.find((i) => i.action === "move-up")?.disabled).toBe(true);
    expect(first.find((i) => i.action === "move-down")?.disabled).toBe(false);
    expect(last.find((i) => i.action === "move-up")?.disabled).toBe(false);
    expect(last.find((i) => i.action === "move-down")?.disabled).toBe(true);
  });

  it("disables both on a lone pin", () => {
    const items = pageMenuItems(["news"], "news", open, { reorder: true });
    expect(items.filter((i) => i.disabled).map((i) => i.action)).toEqual(["move-up", "move-down"]);
  });

  it("offers no moves on a group's entry, pinned or not", () => {
    expect(pageMenuItems(keys, "games", open).map((i) => i.action)).toEqual(["unpin"]);
    expect(pageMenuItems(keys, "codex", open, { reorder: true }).map((i) => i.action)).toEqual(["pin"]);
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
    expect(clubDefaultNames(["voting", "games", "members", "news"])).toBe("Voting, Games, Members and News");
    expect(clubDefaultNames(["news"])).toBe("News");
  });
});

describe("pinsFullMessage", () => {
  it("names the limit, and the hidden pins it counts", () => {
    expect(pinsFullMessage(open)).toBe("Pinned list full (6). Unpin one first.");
    expect(pinsFullMessage({ ...open, room: 4 })).toBe("Pinned list full (6, 2 of them hidden right now). Unpin one first.");
  });
});

describe("notSavedMessage", () => {
  it("says the save failed and the list sprang back", () => {
    expect(notSavedMessage(null)).toBe("Couldn't save your Pinned Pages. Your sidebar is back as it was.");
  });

  it("gives the API's reason for a refused list", () => {
    expect(notSavedMessage("at most 6 Pinned Pages, counting 1 you can't see right now")).toBe(
      "Couldn't save your Pinned Pages: at most 6 Pinned Pages, counting 1 you can't see right now. Your sidebar is back as it was.",
    );
  });
});
