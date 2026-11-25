import { describe, expect, it } from "vitest";
import {
  hidePanel,
  hiddenPanels,
  newPanels,
  panelName,
  panelOrder,
  panelZones,
  type PanelZones,
  revertNote,
  revertNotes,
  withUndrawn,
  showPanel,
} from "@/lib/dashboard/panel-edit";
import { ordinal } from "@/lib/utils";
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

describe("panelZones and panelOrder", () => {
  // news, releases: wide; backlog_pick, now_playing_mine: rail.
  const keys: PanelKey[] = ["news", "backlog_pick", "releases", "now_playing_mine"];

  it("is one zone below lg or with one column in use", () => {
    expect(panelZones(keys, false)).toEqual({ all: keys });
    expect(panelZones(["news", "releases"], true)).toEqual({ all: ["news", "releases"] });
  });

  it("is a zone per column with both in use", () => {
    expect(panelZones(keys, true)).toEqual({ wide: ["news", "releases"], rail: ["backlog_pick", "now_playing_mine"] });
  });

  it("reads one zone back as the order", () => {
    expect(panelOrder(keys, { all: ["releases", "news", "backlog_pick", "now_playing_mine"] } as PanelZones)).toEqual([
      "releases",
      "news",
      "backlog_pick",
      "now_playing_mine",
    ]);
  });

  it("fills each column's places with its new order", () => {
    const zones = { wide: ["releases", "news"], rail: ["now_playing_mine", "backlog_pick"] } as PanelZones;
    expect(panelOrder(keys, zones)).toEqual(["releases", "now_playing_mine", "news", "backlog_pick"]);
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

describe("withUndrawn", () => {
  const drawn = ["news", "releases", "reviews"] as const;

  it("puts keys the page doesn't draw back where they were", () => {
    const api = ["foo", "news", "bar", "releases", "reviews", "baz"];
    expect(withUndrawn(["releases", "news", "reviews"], api, drawn)).toEqual(["foo", "releases", "news", "bar", "reviews", "baz"]);
  });

  it("follows the nearest shown panel when the one before was hidden", () => {
    const api = ["news", "releases", "foo", "reviews"];
    expect(withUndrawn(["news", "reviews"], api, drawn)).toEqual(["news", "foo", "reviews"]);
  });

  it("leaves a list with nothing undrawn as it is", () => {
    expect(withUndrawn(["reviews", "news", "codex"], ["news", "reviews"], drawn)).toEqual(["reviews", "news", "codex"]);
  });
});

describe("revertNotes", () => {
  it("names one change, and counts several", () => {
    expect(revertNotes([{ kind: "hide", key: "news" }])).toBe(revertNote({ kind: "hide", key: "news" }));
    expect(revertNotes([{ kind: "hide", key: "news" }, { kind: "move", key: "codex" }])).toBe("Your last 2 changes went back.");
  });
});
