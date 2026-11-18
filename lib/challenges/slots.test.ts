import { describe, expect, it } from "vitest";

import { previewMatrix, runDates, runMatrix, runStamp, yourSlotsRun, type YearTile } from "@/lib/challenges/slots";
import type { ChallengeRun, ChallengeRunEntry } from "@/lib/challenges/types";

const TODAY = "2026-11-17";

const entry = (over: Partial<ChallengeRunEntry> & Pick<ChallengeRunEntry, "game_id" | "title">): ChallengeRunEntry => ({
  state: "cleared",
  picked_by_hand: false,
  cover_url: `https://img/${over.game_id}.jpg`,
  ...over,
});

// Years Alive from 2019: 2019 Cleared (picked from before the Run), 2020
// open with an In Progress game that fits, 2021 Cleared and moved, 2022 to
// 2025 Cleared, 2026 open.
const run = (over: Partial<ChallengeRun> = {}): ChallengeRun => ({
  id: 9,
  challenge: { id: 3, name: "Years Alive", challenge_format: "slots", schedule: "always_open" },
  user: { user_id: "100", username: "slayer" },
  status: "active",
  started_at: "2026-03-01T15:00:00Z",
  window: { starts_on: "2026-03-01", ends_on: null },
  progress: { cleared: 6, in_progress: 1, target: 8, caught_up: false },
  entries: [
    entry({ game_id: 1, title: "Disco Elysium", slot_year: 2019, picked_by_hand: true, cleared_on: "2021-05-02", release_years: [2019, 2021] }),
    entry({ game_id: 2, title: "Elden Ring", slot_year: 2022, cleared_on: "2026-04-01", release_years: [2022] }),
    entry({ game_id: 3, title: "Persona 5 Royal", slot_year: 2021, picked_by_hand: true, cleared_on: "2026-05-01", release_years: [2019, 2020, 2021, 2023] }),
    entry({ game_id: 4, title: "Baldur's Gate 3", slot_year: 2023, cleared_on: "2026-06-01", release_years: [2020, 2023] }),
    entry({ game_id: 5, title: "Metaphor", slot_year: 2024, cleared_on: "2026-07-01", release_years: [2024] }),
    entry({ game_id: 6, title: "Clair Obscur", slot_year: 2025, cleared_on: "2026-08-01", release_years: [2025] }),
    entry({ game_id: 7, title: "Yakuza: Like a Dragon", state: "in_progress", release_years: [2020, 2026] }),
    entry({ game_id: 8, title: "Final Fantasy XVI", slot_year: null, cleared_on: "2026-09-01", release_years: [2023] }),
  ],
  slots: {
    first_year: 2019,
    last_year: 2026,
    growing: true,
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => ({
      year,
      game_id: { 2019: 1, 2021: 3, 2022: 2, 2023: 4, 2024: 5, 2025: 6 }[year] ?? null,
      title: null,
    })),
  },
  ...over,
});

const tile = (tiles: YearTile[], year: number) => tiles.find((t) => "year" in t && t.year === year);

describe("runMatrix", () => {
  it("lays the years out by decade, ten to a row", () => {
    const m = runMatrix(run(), TODAY);
    expect(m.rows.map((r) => r.label)).toEqual(["10s", "20s"]);
    expect(m.rows.every((r) => r.tiles.length === 10)).toBe(true);
    // Before the first year: nothing; after this year: ghosts.
    expect(m.rows[0].tiles.slice(0, 9).every((t) => t.kind === "none")).toBe(true);
    expect(m.rows[1].tiles.slice(7).map((t) => t.kind)).toEqual(["ghost", "ghost", "ghost"]);
  });

  it("puts each Cleared game in its year with its cover and its tag", () => {
    const tiles = runMatrix(run(), TODAY).rows.flatMap((r) => r.tiles);
    expect(tile(tiles, 2019)).toMatchObject({
      kind: "cleared",
      game: { game_id: 1, title: "Disco Elysium", cover_url: "https://img/1.jpg" },
      tag: "past",
    });
    expect(tile(tiles, 2021)).toMatchObject({ kind: "cleared", tag: "moved" });
    expect(tile(tiles, 2022)).toMatchObject({ kind: "cleared", tag: null });
  });

  it("offers a Cleared game the other open years it was released in", () => {
    const tiles = runMatrix(run(), TODAY).rows.flatMap((r) => r.tiles);
    expect(tile(tiles, 2023)).toMatchObject({ moveYears: [2020] });
    expect(tile(tiles, 2021)).toMatchObject({ moveYears: [2020] });
    expect(tile(tiles, 2022)).toMatchObject({ moveYears: [] });
  });

  it("names the In Progress game that fits an open year, and marks this year", () => {
    const tiles = runMatrix(run(), TODAY).rows.flatMap((r) => r.tiles);
    expect(tile(tiles, 2020)).toEqual({ kind: "open", year: 2020, fits: "Yakuza: Like a Dragon", thisYear: false });
    expect(tile(tiles, 2026)).toEqual({ kind: "open", year: 2026, fits: "Yakuza: Like a Dragon", thisYear: true });
  });

  it("sums the Run up", () => {
    const m = runMatrix(run(), TODAY);
    expect(m.cleared).toBe(6);
    expect(m.target).toBe(8);
    expect(m.openYears).toEqual([2020, 2026]);
    expect(m.line).toBe("Cleared · 1 In Progress · 2 open years");
    expect(m.waiting).toEqual([{ game_id: 8, title: "Final Fantasy XVI", cover_url: "https://img/8.jpg" }]);
    expect(m.tags).toEqual({ past: true, moved: true });
    expect(m.movable.map((g) => [g.game_id, g.moveYears])).toEqual([[3, [2020]], [4, [2020]]]);
  });

  it("draws a fixed range as its own decade and nothing past its last year", () => {
    const fixed = run({
      entries: [],
      progress: { cleared: 0, in_progress: 0, target: 6 },
      slots: { first_year: 1990, last_year: 1995, growing: false, years: [1990, 1991, 1992, 1993, 1994, 1995].map((year) => ({ year })) },
    });
    const m = runMatrix(fixed, TODAY);
    expect(m.rows.map((r) => r.label)).toEqual(["90s"]);
    expect(m.rows[0].tiles.map((t) => t.kind)).toEqual([...Array(6).fill("open"), ...Array(4).fill("none")]);
    expect(m.line).toBe("Cleared · 6 open years");
  });
});

describe("previewMatrix", () => {
  it("shows a Run's years before it starts as ghosts", () => {
    const m = previewMatrix(1998, 2026, TODAY);
    expect(m.rows.map((r) => r.label)).toEqual(["90s", "00s", "10s", "20s"]);
    expect(m.rows[0].tiles.slice(8).map((t) => t.kind)).toEqual(["ghost", "ghost"]);
    expect(m.rows[0].tiles[7].kind).toBe("none");
    expect(m.target).toBe(29);
  });
});

describe("yourSlotsRun", () => {
  const mine = (id: number, status: ChallengeRun["status"], started_at: string) =>
    run({ id, status, started_at });
  it("takes your Active Run, else your newest", () => {
    const runs = [mine(1, "abandoned", "2026-01-01T00:00:00Z"), mine(2, "active", "2025-01-01T00:00:00Z")];
    expect(yourSlotsRun(runs, "100")?.id).toBe(2);
    expect(yourSlotsRun([runs[0], mine(3, "finished", "2026-02-01T00:00:00Z")], "100")?.id).toBe(3);
    expect(yourSlotsRun(runs, "999")).toBeNull();
  });
});

describe("runStamp", () => {
  it("stamps a Caught Up, Finished or ended Run", () => {
    expect(runStamp(run({ progress: { cleared: 8, in_progress: 0, target: 8, caught_up: true } }))).toBe("Caught Up");
    expect(runStamp(run({ status: "finished" }))).toBe("Finished");
    expect(runStamp(run({ status: "abandoned" }))).toBe("Abandoned");
    expect(runStamp(run())).toBeNull();
  });
});

describe("runDates", () => {
  it("says where the Run starts and when it started", () => {
    expect(runDates(run(), TODAY)).toBe("from 2019 · started 1 Mar");
    expect(runDates(run({ started_at: "2025-03-03T15:00:00Z" }), TODAY)).toBe("from 2019 · started 3 Mar 2025");
  });
});
