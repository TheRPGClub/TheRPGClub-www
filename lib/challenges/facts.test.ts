import { describe, expect, it } from "vitest";

import { bannerArt, challengeFacts, hostName, poolLine, scheduleChip, slotsChips } from "@/lib/challenges/facts";
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
    target: 3,
    franchises: [{ franchise_id: 1, name: "Final Fantasy" }],
    collections: [],
    included_games: [],
  },
} as unknown as Challenge;

describe("challenge facts", () => {
  it("lists the Host, Season, Finish and Pool", () => {
    expect(challengeFacts(fall, "2026-11-17", 41)).toEqual([
      { term: "Host", detail: "Crit Fisher" },
      { term: "Season", detail: "22 Sep – 20 Dec, every year" },
      { term: "Finish", detail: "Clear 3 games from the Pool" },
      { term: "Pool", detail: "Final Fantasy franchise · 41 games" },
    ]);
  });

  it("names the club as Host of a club-hosted Challenge", () => {
    expect(hostName({ hosted_by_club: true, host: null })).toBe("The RPG Club");
  });

  it("counts the games added by hand", () => {
    const pool = {
      ...fall.pool!,
      target: "all" as const,
      included_games: [{ game_id: 1, title: "x" }],
    };
    expect(poolLine({ pool }, null)).toBe("Final Fantasy franchise, 1 added");
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
    expect(challengeFacts(years, "2026-11-17", null)).toEqual([
      { term: "Host", detail: "Crit Fisher" },
      { term: "Open", detail: "Any time" },
      { term: "Years", detail: "Your birth year to now, one game each" },
      { term: "Finish", detail: "Clear every year to be Caught Up; a year opens every 1 January" },
      { term: "Past play", detail: "Counts: pick a Game Completion from before your Run for an open year" },
    ]);
    expect(challengeFacts(nineties, "2026-11-17", null).slice(2)).toEqual([
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
