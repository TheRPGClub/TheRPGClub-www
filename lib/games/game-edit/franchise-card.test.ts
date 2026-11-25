import { describe, expect, it } from "vitest";
import type { FranchiseGame, FranchisePage } from "@/lib/franchises/types";
import { countsLine, franchiseCardRun, franchiseCounts, ordinal, placeSentence, type CardGame } from "./franchise-card";

const g = (game_id: number, release_year: number | null, title = `Game ${game_id}`): FranchiseGame => ({
  game_id,
  title,
  cover_url: null,
  release_year,
  mainline: false,
  source: "manual",
  parent_game_name: null,
});

const page = (over: Partial<FranchisePage["games"]> = {}): FranchisePage => ({
  franchise_id: 7,
  name: "Final Fantasy",
  igdb_franchise_id: null,
  created_by: null,
  name_locked: false,
  merged_into_id: null,
  viewer: { can_edit: true, can_admin: false },
  games: { mainline: [g(1, 1987), g(2, 1988)], other: [g(10, 1997), g(11, 2003), g(12, 2022)], add_ons: [], ...over },
});

const me: CardGame = { game_id: 99, title: "Crisis Core", cover_url: null, release_year: 2008 };

describe("franchiseCounts", () => {
  it("counts every game, Add-ons only when there are some", () => {
    expect(countsLine(franchiseCounts(page()))).toBe("5 games · 2 Mainline · 3 Spin-offs");
    const withAddOns = page({ add_ons: [{ parent: null, games: [g(20, 2001)] }] });
    expect(countsLine(franchiseCounts(withAddOns))).toBe("6 games · 2 Mainline · 3 Spin-offs · 1 Add-on");
  });
});

describe("franchiseCardRun", () => {
  it("rings the game in its place when it is in the run", () => {
    const run = franchiseCardRun(page(), "spinoff", { ...me, game_id: 11 }, null);
    expect(run.landing).toBe(false);
    expect(run.place).toBe(2);
    expect(run.total).toBe(3);
    expect(run.tiles.map((t) => t.me)).toEqual([false, true, false]);
    expect(run.label).toBe("Spin-offs, by release");
  });

  it("lands a staged game by release", () => {
    const run = franchiseCardRun(page(), "spinoff", me, null);
    expect(run.landing).toBe(true);
    expect(run.tiles.map((t) => t.game_id)).toEqual([10, 11, 99, 12]);
    expect(run.place).toBe(3);
  });

  it("lands an undated game last, and moving to Mainline lands it there", () => {
    expect(franchiseCardRun(page(), "mainline", { ...me, release_year: null }, null).place).toBe(3);
    expect(franchiseCardRun(page(), "mainline", { ...me, game_id: 10 }, null).landing).toBe(true);
  });

  it("windows a long run around the game", () => {
    const other = Array.from({ length: 30 }, (_, i) => g(100 + i, 1990 + i));
    const run = franchiseCardRun(page({ other }), "spinoff", { ...me, game_id: 115 }, null, 3);
    expect(run.tiles.map((t) => t.game_id)).toEqual([112, 113, 114, 115, 116, 117, 118]);
    expect([run.before, run.after]).toEqual([12, 11]);
  });

  it("finds an Add-on's group by the game, the parent's name or a picked parent's id", () => {
    const parent = { game_id: 1, title: "FF", cover_url: null, release_year: 1987, in_franchise: true };
    const add_ons = [
      { parent, games: [g(30, 2001), g(99, 2004)] },
      { parent: { ...parent, game_id: 2, title: "FF II" }, games: [g(40, 2002)] },
    ];
    const p = page({ add_ons });
    const loaded = franchiseCardRun(p, "addon", me, { game_id: null, name: "Elsewhere" });
    expect([loaded.landing, loaded.total]).toEqual([false, 2]);
    expect(franchiseCardRun(p, "addon", { ...me, game_id: 98 }, { game_id: null, name: "FF II" }).total).toBe(2);
    const picked = franchiseCardRun(p, "addon", me, { game_id: 2, name: "FF II" });
    expect([picked.landing, picked.total, picked.label]).toEqual([true, 2, "Add-ons of FF II"]);
  });

  it("is the game alone with no page (a new Franchise)", () => {
    const run = franchiseCardRun(null, "mainline", me, null);
    expect([run.place, run.total, run.landing]).toEqual([1, 1, true]);
  });
});

describe("place words", () => {
  it("ordinals and the screen reader sentence", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 111].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "111th"]);
    const run = franchiseCardRun(page(), "spinoff", me, null);
    expect(placeSentence(run)).toBe("This game lands here on Save: 3rd of 4.");
  });
});
