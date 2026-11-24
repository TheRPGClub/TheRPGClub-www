import { describe, expect, it } from "vitest";

import {
  clubToday,
  completionDateProblems,
  dayBlock,
  dayOf,
  dayOfDate,
  dateOfDay,
  isIsoDay,
  longDay,
  nowPlayingDateProblems,
  spanText,
} from "./dates";

const TODAY = "2026-11-24";

describe("completionDateProblems", () => {
  it("accepts Started on or before Finished, and Finished today", () => {
    expect(completionDateProblems("2026-11-09", TODAY, TODAY)).toEqual({});
    expect(completionDateProblems(TODAY, TODAY, TODAY)).toEqual({});
  });

  it("accepts a blank Started", () => {
    expect(completionDateProblems(null, TODAY, TODAY)).toEqual({});
  });

  it("refuses Started after Finished, on Started", () => {
    expect(completionDateProblems("2026-11-20", "2026-11-10", TODAY)).toEqual({
      started: "Started can't be after Finished.",
    });
  });

  it("refuses Finished in the future, on Finished", () => {
    expect(completionDateProblems(null, "2026-11-25", TODAY)).toEqual({
      finished: "Finished can't be in the future.",
    });
  });

  it("names both when both are wrong", () => {
    expect(completionDateProblems("2026-12-02", "2026-12-01", TODAY)).toEqual({
      started: "Started can't be after Finished.",
      finished: "Finished can't be in the future.",
    });
  });

  it("refuses a future Started when Finished is blank (an old undated completion)", () => {
    expect(completionDateProblems("2026-12-01", null, TODAY)).toEqual({
      started: "Started can't be in the future.",
    });
  });
});

describe("nowPlayingDateProblems", () => {
  it("refuses a Started day after today", () => {
    expect(nowPlayingDateProblems("2026-11-25", TODAY)).toEqual({ started: "Started can't be in the future." });
    expect(nowPlayingDateProblems(TODAY, TODAY)).toEqual({});
  });
});

describe("days", () => {
  it("reads a stored timestamp as its club day and a plain day as it is", () => {
    // A completion day as the API stores it: noon club time (same UTC date).
    expect(dayOf("2019-03-14T16:00:00.000Z")).toBe("2019-03-14");
    expect(dayOf("2026-07-04T16:00:00Z")).toBe("2026-07-04");
    // A Now Playing start on a club evening is that club day, not the UTC next.
    expect(dayOf("2026-11-09T22:30:00-05:00")).toBe("2026-11-09");
    expect(dayOf("2026-11-10T03:30:00Z")).toBe("2026-11-09");
    expect(dayOf("2026-11-09")).toBe("2026-11-09");
    expect(dayOf(null)).toBeNull();
    expect(dayOf("not a date")).toBeNull();
  });

  it("checks real calendar days", () => {
    expect(isIsoDay("2026-02-29")).toBe(false);
    expect(isIsoDay("2028-02-29")).toBe(true);
  });

  it("round-trips a day through the calendar's Date", () => {
    expect(dayOfDate(dateOfDay("2026-11-09"))).toBe("2026-11-09");
  });

  it("writes days for the slip", () => {
    expect(longDay(TODAY)).toBe("Tue 24 Nov 2026");
    expect(dayBlock("2026-11-09")).toEqual({ day: "09", monthYear: "Nov 2026" });
  });

  it("counts the days between Started and Finished", () => {
    expect(spanText("2026-11-09", TODAY)).toBe("15 days");
    expect(spanText("2026-11-23", TODAY)).toBe("1 day");
    expect(spanText(TODAY, TODAY)).toBe("Same day");
    expect(spanText(null, TODAY)).toBeNull();
    expect(spanText(TODAY, "2026-11-01")).toBeNull();
  });
});

describe("the day rule on a club evening", () => {
  // 21:30 club time on 24 Nov is 02:30 UTC on 25 Nov.
  const evening = new Date("2026-11-25T02:30:00Z");

  it("lets a start made this evening be saved as today", () => {
    const today = clubToday(evening);
    expect(today).toBe("2026-11-24");
    const started = dayOf("2026-11-25T02:00:00Z");
    expect(started).toBe("2026-11-24");
    expect(nowPlayingDateProblems(started, today)).toEqual({});
    expect(completionDateProblems(started, today, today)).toEqual({});
  });

  it("still refuses tomorrow", () => {
    const today = clubToday(evening);
    expect(completionDateProblems(null, "2026-11-25", today)).toEqual({ finished: "Finished can't be in the future." });
  });
});
