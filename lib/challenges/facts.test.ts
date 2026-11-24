import { describe, expect, it } from "vitest";

import { bannerArt, challengeFacts, finishLine, hostName, poolLine, scheduleChip, slotsChips } from "@/lib/challenges/facts";
import type { Challenge } from "@/lib/challenges/types";

const fall = {
  id: 1,
  name: "Fall of Final Fantasy",
  challenge_format: "pool",
  hosted_by_club: false,
  host: { user_id: "1", username: "crit_fisher", global_name: "Crit Fisher" },
  schedule: "seasonal",
  season: { start: "09-22", end: "12-20", crosses_new_year: false },
  open: true,
  pool: {
    optional_target: 2,
    franchises: [{ franchise_id: 1, name: "Final Fantasy" }],
    collections: [{ collection_id: 7, name: "Final Fantasy VII" }],
    core_count: 14,
    optional_count: 12,
  },
} as unknown as Challenge;

describe("challenge facts", () => {
  it("lists the Host, Season, Finish and Pool", () => {
    expect(challengeFacts(fall, "2026-11-17")).toEqual([
      { term: "Host", detail: "Crit Fisher" },
      { term: "Season", detail: "22 Sep – 20 Dec, every year" },
      { term: "Finish", detail: "Clear all 14 Core Games and 2 Optional Games" },
      {
        term: "Pool",
        detail: "14 Core · 12 Optional · from the Final Fantasy Franchise and the Final Fantasy VII Series",
      },
    ]);
  });

  it("names the club as Host of a club-hosted Challenge", () => {
    expect(hostName({ hosted_by_club: true, host: null })).toBe("The RPG Club");
  });

  it("says how a Pool Run Finishes, with or without Core Games and a target", () => {
    const pool = (core: number, target: number) => ({ pool: { ...fall.pool!, core_count: core, optional_target: target } });
    expect(finishLine(pool(1, 0))).toBe("Clear the 1 Core Game");
    expect(finishLine(pool(5, 0))).toBe("Clear all 5 Core Games");
    expect(finishLine(pool(0, 1))).toBe("Clear 1 Optional Game");
    expect(finishLine({ pool: null })).toBeNull();
    expect(poolLine({ pool: { optional_target: 0, core_count: 3, franchises: [], collections: [] } })).toBe("3 Core");
  });

  it("chips the Season, or when a Closed one opens", () => {
    expect(scheduleChip(fall, "2026-11-17")).toBe("Season 2026 · 22 Sep – 20 Dec");
    expect(scheduleChip({ ...fall, open: false }, "2026-12-21")).toBe("Closed · opens 22 Sep 2027");
    expect(scheduleChip({ ...fall, schedule: "always_open", season: null }, "2026-11-17")).toBe("Always Open");
  });

  it("takes the key art, else a Pool game's art or cover", () => {
    expect(bannerArt({ key_art_url: "k" }, [])).toBe("k");
    expect(
      bannerArt({ key_art_url: null }, [
        { game_id: 1, title: "a", cover_url: "c" },
        { game_id: 2, title: "b", art_url: "a" },
      ]),
    ).toBe("a");
    expect(bannerArt({}, [])).toBeNull();
  });
});

// www#109: a Slots Challenge's range, how to Finish and Counts past play.
describe("Slots facts", () => {
  const years = {
    ...fall,
    name: "Years Alive",
    challenge_format: "slots",
    schedule: "always_open",
    season: null,
    pool: null,
    slots: { first_year: "birth_year", last_year: "current_year", counts_past_play: true },
  } as unknown as Challenge;
  const nineties = { ...years, slots: { first_year: 1990, last_year: 1999, counts_past_play: false } } as Challenge;

  it("says the years, how to Finish or be Caught Up, and Counts past play", () => {
    expect(challengeFacts(years, "2026-11-17")).toEqual([
      { term: "Host", detail: "Crit Fisher" },
      { term: "Open", detail: "Any time" },
      { term: "Years", detail: "Your birth year to now, one game each" },
      { term: "Finish", detail: "Clear every year to be Caught Up; a year opens every 1 January" },
      { term: "Past play", detail: "Counts: pick a Game Completion from before your Run for an open year" },
    ]);
    expect(challengeFacts(nineties, "2026-11-17").slice(2)).toEqual([
      { term: "Years", detail: "1990 to 1999, one game each" },
      { term: "Finish", detail: "Clear all 10 years" },
    ]);
  });

  it("chips the banner with Counts past play and the range", () => {
    expect(slotsChips(years)).toEqual(["Counts past play", "Birth year to now"]);
    expect(slotsChips(nineties)).toEqual(["1990 to 1999"]);
    expect(slotsChips(fall)).toEqual([]);
  });
});
