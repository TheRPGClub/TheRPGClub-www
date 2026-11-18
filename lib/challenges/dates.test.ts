import { describe, expect, it } from "vitest";

import {
  clubToday,
  closedNote,
  daysBetween,
  daysLeft,
  formatDay,
  seasonAround,
  whenLabel,
} from "@/lib/challenges/dates";

const autumn = { start: "09-22", end: "12-20", crosses_new_year: false };
const winter = { start: "12-01", end: "02-28", crosses_new_year: true };

describe("clubToday", () => {
  it("reads the day in the club's time zone, not UTC", () => {
    // 03:00 UTC on 18 Nov is still 17 Nov in New York.
    expect(clubToday(new Date("2026-11-18T03:00:00Z"))).toBe("2026-11-17");
  });
});

describe("seasonAround", () => {
  it("finds the Season holding today", () => {
    expect(seasonAround(autumn, "2026-11-17")).toEqual({
      starts: "2026-09-22",
      ends: "2026-12-20",
    });
  });

  it("finds the next Season when today is outside one", () => {
    expect(seasonAround(autumn, "2026-12-21")).toEqual({
      starts: "2027-09-22",
      ends: "2027-12-20",
    });
  });

  it("holds a Season across the new year", () => {
    expect(seasonAround(winter, "2027-01-10")).toEqual({
      starts: "2026-12-01",
      ends: "2027-02-28",
    });
    expect(seasonAround(winter, "2026-11-17")).toEqual({
      starts: "2026-12-01",
      ends: "2027-02-28",
    });
  });

  it("moves a 29 February edge in a year without one", () => {
    expect(seasonAround({ start: "02-29", end: "03-31" }, "2027-01-01").starts).toBe("2027-03-01");
    expect(seasonAround({ start: "02-01", end: "02-29" }, "2027-01-01").ends).toBe("2027-02-28");
  });
});

describe("daysLeft", () => {
  const seasonal = {
    schedule: "seasonal" as const,
    season: autumn,
    ends_on: null,
    open: true,
  };

  it("counts today inside a Season", () => {
    expect(daysLeft(seasonal, "2026-12-20")).toBe(1);
    expect(daysLeft(seasonal, "2026-11-17")).toBe(34);
  });

  it("has no clock while Closed or Always Open without an end", () => {
    expect(daysLeft({ ...seasonal, open: false }, "2026-12-21")).toBeNull();
    expect(daysLeft({ schedule: "always_open", season: null, ends_on: null, open: true }, "2026-11-17")).toBeNull();
  });

  it("counts to an Always Open Challenge's end date", () => {
    expect(
      daysLeft(
        {
          schedule: "always_open",
          season: null,
          ends_on: "2026-11-30",
          open: true,
        },
        "2026-11-17",
      ),
    ).toBe(14);
  });
});

describe("labels", () => {
  it("names when a Challenge runs", () => {
    expect(whenLabel({ schedule: "seasonal", season: autumn })).toBe("Season 22 Sep – 20 Dec");
    expect(whenLabel({ schedule: "always_open", season: null })).toBe("Always Open");
  });

  it("writes a day with its year only when it isn't this year", () => {
    expect(formatDay("2026-12-01", "2026-11-17")).toBe("1 Dec");
    expect(formatDay("2027-06-21", "2026-11-17")).toBe("21 Jun 2027");
  });

  it("tapes a Closed Challenge with when it opens or ended", () => {
    expect(closedNote({ schedule: "seasonal", season: winter, ends_on: null, open: false }, "2026-11-17")).toBe(
      "Opens 1 Dec",
    );
    expect(
      closedNote(
        {
          schedule: "always_open",
          season: null,
          ends_on: "2026-03-03",
          open: false,
        },
        "2026-11-17",
      ),
    ).toBe("Ended 3 Mar");
    expect(closedNote({ schedule: "seasonal", season: winter, ends_on: null, open: true }, "2026-11-17")).toBeNull();
  });

  it("counts whole days", () => {
    expect(daysBetween("2026-12-31", "2027-01-02")).toBe(2);
  });
});
