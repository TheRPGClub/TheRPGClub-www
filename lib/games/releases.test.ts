import { describe, expect, it } from "vitest";

import type { DatePrecision, Release } from "@/lib/api/types";
import {
  countdown,
  isPastRelease,
  periodEnd,
  precisionNote,
  regionTone,
  releaseDateLabel,
  releasesByPlatform,
  releasesCount,
  utcToday,
} from "@/lib/games/releases";

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

describe("releaseDateLabel", () => {
  it("prints an exact day", () => {
    expect(releaseDateLabel("2025-09-25", "day")).toBe("25 Sep 2025");
  });

  it("never prints a vague date as a day", () => {
    expect(releaseDateLabel("2026-12-01", "month")).toBe("Dec 2026");
    expect(releaseDateLabel("2027-07-01", "quarter")).toBe("Q3 2027");
    expect(releaseDateLabel("2027-01-01", "year")).toBe("2027");
  });

  it("has no label for TBA", () => {
    expect(releaseDateLabel(null, "tba")).toBeNull();
    expect(releaseDateLabel(null, "day")).toBeNull();
  });

  it("reads the calendar day, whatever the time zone", () => {
    expect(releaseDateLabel("2026-01-01", "day")).toBe("1 Jan 2026");
  });
});

describe("precisionNote", () => {
  it("says what is still unknown", () => {
    expect(precisionNote("day")).toBeNull();
    expect(precisionNote("month")).toBe("Day TBA");
    expect(precisionNote("quarter")).toBe("Month TBA");
    expect(precisionNote("year")).toBe("Month TBA");
    expect(precisionNote("tba")).toBe("No date yet");
  });
});

describe("periodEnd", () => {
  it("ends each period on its last day", () => {
    expect(periodEnd("2026-11-19", "day")).toBe("2026-11-19");
    expect(periodEnd("2027-02-01", "month")).toBe("2027-02-28");
    expect(periodEnd("2027-10-01", "quarter")).toBe("2027-12-31");
    expect(periodEnd("2027-01-01", "year")).toBe("2027-12-31");
    expect(periodEnd(null, "tba")).toBeNull();
  });
});

describe("isPastRelease", () => {
  const today = "2026-11-18";

  it("is past once its whole period ended", () => {
    expect(isPastRelease(release("2026-11-17", "day"), today)).toBe(true);
    expect(isPastRelease(release("2026-10-01", "month"), today)).toBe(true);
  });

  it("is not past on the day, while its period runs, or when TBA", () => {
    expect(isPastRelease(release("2026-11-18", "day"), today)).toBe(false);
    expect(isPastRelease(release("2026-11-01", "month"), today)).toBe(false);
    expect(isPastRelease(release("2026-10-01", "quarter"), today)).toBe(false);
    expect(isPastRelease(release(null, "tba"), today)).toBe(false);
  });
});

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

describe("regionTone", () => {
  it("inks the three big regions and strokes the rest", () => {
    expect(regionTone("NA")).toBe("region-na");
    expect(regionTone("eu")).toBe("region-eu");
    expect(regionTone("JP")).toBe("region-jp");
    expect(regionTone("WW")).toBe("region-ww");
    expect(regionTone("AUS")).toBe("region");
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

describe("utcToday", () => {
  it("is the UTC calendar day", () => {
    expect(utcToday(new Date("2026-11-18T23:30:00-05:00"))).toBe("2026-11-19");
  });
});
