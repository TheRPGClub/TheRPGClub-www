import { describe, expect, it } from "vitest";

import { bannerArt, challengeFacts, hostName, poolLine, scheduleChip } from "@/lib/challenges/facts";
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
