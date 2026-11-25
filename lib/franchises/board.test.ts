import { describe, expect, it } from "vitest";
import {
  canDropInZone,
  franchiseBoardView,
  franchiseLinkData,
  franchiseZones,
  planFranchiseMove,
  settleZones,
} from "./board";
import { franchiseLayout } from "./page";
import type { FranchiseGame, FranchisePage } from "./types";

const g = (game_id: number, title: string, release_year: number | null, extra: Partial<FranchiseGame> = {}): FranchiseGame => ({
  game_id,
  title,
  cover_url: null,
  release_year,
  mainline: false,
  source: "igdb",
  parent_game_name: null,
  ...extra,
});

const layout = franchiseLayout({
  franchise_id: 1,
  name: "Final Fantasy",
  igdb_franchise_id: 9,
  created_by: null,
  name_locked: false,
  merged_into_id: null,
  viewer: { can_edit: true, can_admin: false },
  games: {
    mainline: [g(1, "Final Fantasy", 1987, { mainline: true }), g(16, "Final Fantasy XVI", 2023, { mainline: true })],
    other: [g(30, "Final Fantasy Tactics", 1997), g(40, "Mobius", 2015)],
    add_ons: [
      {
        parent: { game_id: 16, title: "Final Fantasy XVI", cover_url: null, release_year: 2023, in_franchise: true },
        games: [g(161, "Echoes of the Fallen", 2023), g(162, "The Rising Tide", 2024)],
      },
      {
        parent: { game_id: 77, title: "Kingdom Hearts", cover_url: null, release_year: 2002, in_franchise: false },
        games: [g(771, "Final Mix", 2002)],
      },
      { parent: null, games: [g(900, "Orphan DLC", null, { parent_game_name: "Lost Game" })] },
    ],
  },
} satisfies FranchisePage);

describe("franchiseZones", () => {
  it("puts every Add-on in the Add-ons zone, those under the page's games first", () => {
    expect(franchiseZones(layout)).toEqual({ mainline: [1, 16], other: [30, 40], addons: [161, 162, 771, 900] });
  });
});

describe("franchiseBoardView", () => {
  it("draws the saved zones as the page does", () => {
    const view = franchiseBoardView(layout, franchiseZones(layout));
    expect(view.mainline.map((e) => [e.game_id, e.numeral, e.addOns.map((a) => a.game_id)])).toEqual([
      [1, "I", []],
      [16, "II", [161, 162]],
    ]);
    expect(view.strays.map((s) => [s.key, s.parent, s.games.map((a) => a.game_id)])).toEqual([
      ["77", "Kingdom Hearts", [771]],
      ["none-1", "Lost Game", [900]],
    ]);
    expect(view.incoming).toEqual([]);
  });

  it("follows a game across zones: an Add-on into Mainline, a spin-off into Add-ons", () => {
    const view = franchiseBoardView(layout, { mainline: [1, 161, 16], other: [40], addons: [30, 162, 771, 900] });
    expect(view.mainline.map((e) => [e.game_id, e.numeral])).toEqual([[1, "I"], [161, "II"], [16, "III"]]);
    expect(view.mainline[2].addOns.map((a) => a.game_id)).toEqual([162]);
    expect(view.incoming.map((a) => a.game_id)).toEqual([30]);
  });

  it("drops a stray group whose Add-ons all left", () => {
    const view = franchiseBoardView(layout, { mainline: [1, 16, 771], other: [30, 40], addons: [161, 162, 900] });
    expect(view.strays.map((s) => s.key)).toEqual(["none-1"]);
  });
});

describe("settleZones", () => {
  it("puts Mainline and Spin-offs back in release order", () => {
    const settled = settleZones(layout, { mainline: [16, 30, 1], other: [771, 40], addons: [] });
    expect(settled).toEqual({ mainline: [1, 30, 16], other: [771, 40], addons: [] });
  });
});

describe("canDropInZone", () => {
  const view = franchiseBoardView(layout, franchiseZones(layout));
  it("keeps a game with Add-ons out of Add-ons (no nesting)", () => {
    expect(canDropInZone(view, 16, "addons")).toBe(false);
    expect(canDropInZone(view, 16, "other")).toBe(true);
    expect(canDropInZone(view, 1, "addons")).toBe(true);
  });
});

describe("planFranchiseMove", () => {
  it("saves Mainline between Mainline and Spin-offs", () => {
    expect(planFranchiseMove("other", "mainline")).toEqual({ kind: "save", data: { mainline: true } });
    expect(planFranchiseMove("mainline", "other")).toEqual({ kind: "save", data: { mainline: false } });
  });
  it("clears the parent when an Add-on leaves Add-ons", () => {
    expect(planFranchiseMove("addons", "mainline")).toEqual({ kind: "save", data: { parent_game_id: null, mainline: true } });
    expect(planFranchiseMove("addons", "other")).toEqual({ kind: "save", data: { parent_game_id: null, mainline: false } });
  });
  it("asks for the parent on a drop into Add-ons", () => {
    expect(planFranchiseMove("mainline", "addons")).toEqual({ kind: "pick-parent" });
    expect(planFranchiseMove("addons", "addons")).toEqual({ kind: "pick-parent" });
  });
  it("saves nothing for a drop inside its own section (release order)", () => {
    expect(planFranchiseMove("mainline", "mainline")).toEqual({ kind: "none" });
  });
});

describe("franchiseLinkData", () => {
  it("sends only what is given", () => {
    expect(franchiseLinkData(5)).toEqual({ data: {} });
    expect(franchiseLinkData(5, true)).toEqual({ data: { mainline: true } });
    expect(franchiseLinkData(5, undefined, 16)).toEqual({ data: { parent_game_id: 16 } });
    expect(franchiseLinkData(5, false, null)).toEqual({ data: { parent_game_id: null, mainline: false } });
  });
  it("refuses a bad parent before asking the API", () => {
    expect(franchiseLinkData(5, undefined, 5)).toEqual({ error: "A game can't be an Add-on of itself." });
    expect(franchiseLinkData(5, undefined, 0)).toEqual({ error: "Pick the game it's an Add-on of." });
  });
});
