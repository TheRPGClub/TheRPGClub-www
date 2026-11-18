import { describe, expect, it } from "vitest";

import type { DatePrecision, Release } from "@/lib/api/types";
import { countdown, releasesByPlatform, releasesCount } from "@/lib/games/releases";

let nextId = 1;
function release(
  date: string | null,
  precision: DatePrecision,
  platform: [number, string] = [1, "PlayStation 5"],
  region = "NA",
): Release {
  return {
    release_id: nextId++,
    game_id: 9,
    platform_id: platform[0],
    region_id: 1,
    format: null,
    notes: null,
    release_date: date,
    date_precision: precision,
    source: "igdb",
    platform_code: "PS5",
    platform_name: platform[1],
    region_code: region,
    region_name: region,
  };
}

describe("countdown", () => {
  const today = "2026-11-17";

  it("counts down to a day this week", () => {
    expect(countdown(release("2026-11-17", "day"), today)).toBe("Today");
    expect(countdown(release("2026-11-18", "day"), today)).toBe("Tomorrow");
    expect(countdown(release("2026-11-19", "day"), today)).toBe("In 2 days");
    expect(countdown(release("2026-11-24", "day"), today)).toBe("In 7 days");
  });

  it("stays quiet for a later, past or vague date", () => {
    expect(countdown(release("2026-11-25", "day"), today)).toBeNull();
    expect(countdown(release("2026-11-16", "day"), today)).toBeNull();
    expect(countdown(release("2026-11-01", "month"), today)).toBeNull();
  });
});

describe("releasesByPlatform", () => {
  it("keeps the API's order, one row per platform", () => {
    const ps5 = release("2025-09-25", "day", [1, "PlayStation 5"], "JP");
    const pc = release("2026-01-09", "day", [2, "PC (Windows)"], "WW");
    const ps5Eu = release("2026-01-16", "day", [1, "PlayStation 5"], "EU");
    const xbox = release(null, "tba", [3, "Xbox Series X|S"], "WW");
    const rows = releasesByPlatform([ps5, pc, ps5Eu, xbox]);
    expect(rows.map((r) => r.platformName)).toEqual([
      "PlayStation 5",
      "PC (Windows)",
      "Xbox Series X|S",
    ]);
    expect(rows[0].releases).toEqual([ps5, ps5Eu]);
  });
});

describe("releasesCount", () => {
  it("counts Releases and platforms", () => {
    expect(releasesCount(14, 6)).toBe("14 Releases · 6 platforms");
    expect(releasesCount(1, 1)).toBe("1 Release · 1 platform");
  });
});
