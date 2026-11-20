import { describe, expect, it } from "vitest";
import {
  hidePanel,
  hiddenPanels,
  movePanel,
  newPanels,
  ordinal,
  panelName,
  placePanel,
  revertNote,
  showPanel,
} from "@/lib/dashboard/panel-edit";
import type { PanelKey } from "@/lib/dashboard/panels";

const all = { shown: () => true };
const without = (feature: string) => ({ shown: (key: string) => key !== feature });
const entry = (key: string, isNew = false) => ({ key, new: isNew });

describe("hiddenPanels", () => {
  const catalogue = [entry("news"), entry("codex"), entry("unknown_panel"), entry("birthdays"), entry("reviews")];

  it("lists the catalogue's panels not shown, in the club's order", () => {
    expect(hiddenPanels(catalogue, ["news"], all)).toEqual(["codex", "birthdays", "reviews"]);
  });

  it("leaves out keys the website doesn't know and Features the member isn't shown", () => {
    expect(hiddenPanels(catalogue, [], without("club_codex"))).toEqual(["news", "birthdays", "reviews"]);
  });

  it("is empty when everything is shown", () => {
    expect(hiddenPanels([entry("news")], ["news"], all)).toEqual([]);
  });
});

describe("newPanels", () => {
  it("keeps the known panels marked new", () => {
    expect(newPanels([entry("news"), entry("codex", true), entry("later", true)])).toEqual(["codex"]);
  });
});

describe("movePanel", () => {
  const keys: PanelKey[] = ["news", "releases", "codex"];

  it("swaps with the neighbour", () => {
    expect(movePanel(keys, "releases", -1)).toEqual(["releases", "news", "codex"]);
    expect(movePanel(keys, "releases", 1)).toEqual(["news", "codex", "releases"]);
  });

  it("refuses past either end or for a panel not shown", () => {
    expect(movePanel(keys, "news", -1)).toBeNull();
    expect(movePanel(keys, "codex", 1)).toBeNull();
    expect(movePanel(keys, "reviews", 1)).toBeNull();
  });
});

describe("placePanel", () => {
  const keys: PanelKey[] = ["news", "releases", "codex"];

  it("puts the panel before another, or at the end", () => {
    expect(placePanel(keys, "codex", "news")).toEqual(["codex", "news", "releases"]);
    expect(placePanel(keys, "news", null)).toEqual(["releases", "codex", "news"]);
  });

  it("is null when nothing moves", () => {
    expect(placePanel(keys, "news", "releases")).toBeNull();
    expect(placePanel(keys, "news", "news")).toBeNull();
    expect(placePanel(keys, "codex", null)).toBeNull();
    expect(placePanel(keys, "reviews", null)).toBeNull();
  });
});

describe("showPanel and hidePanel", () => {
  it("adds a panel at the end and takes one out", () => {
    expect(showPanel(["news"], "codex")).toEqual(["news", "codex"]);
    expect(showPanel(["news"], "news")).toBeNull();
    expect(hidePanel(["news", "codex"], "news")).toEqual(["codex"]);
    expect(hidePanel(["news"], "codex")).toBeNull();
  });
});

describe("panelName and revertNote", () => {
  it("tells Mine and Club apart only where both exist", () => {
    expect(panelName("now_playing_mine")).toBe("Now Playing (Mine)");
    expect(panelName("now_playing_club")).toBe("Now Playing (Club)");
    expect(panelName("news")).toBe("Latest News");
  });

  it("says what went back", () => {
    expect(revertNote({ kind: "move", key: "news" })).toBe("Latest News went back to where it was.");
    expect(revertNote({ kind: "show", key: "codex" })).toBe("Codex fact is hidden again.");
    expect(revertNote({ kind: "hide", key: "news" })).toBe("Latest News is back on your dashboard.");
  });
});

describe("ordinal", () => {
  it("names a place", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 103].map(ordinal)).toEqual([
      "1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "103rd",
    ]);
  });
});
