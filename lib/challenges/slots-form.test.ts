import { describe, expect, it } from "vitest";

import {
  lastFromRuler,
  rulerScale,
  slotsCountLine,
  slotsDraftFrom,
  slotsErrors,
  slotsRequest,
  SLOTS_DEFAULTS,
} from "@/lib/challenges/slots-form";

describe("slotsDraftFrom", () => {
  it("reads a saved Challenge's Slots settings", () => {
    expect(slotsDraftFrom({ first_year: 1990, last_year: 1999, counts_past_play: false })).toEqual({
      first: 1990,
      last: 1999,
      countsPastPlay: false,
    });
  });

  it("starts a new Challenge at each member's birth year to the current year, not counting past play", () => {
    expect(slotsDraftFrom(null)).toEqual(SLOTS_DEFAULTS);
    expect(SLOTS_DEFAULTS).toEqual({ first: "birth_year", last: "current_year", countsPastPlay: false });
  });
});

describe("slotsRequest", () => {
  it("sends the range and Counts past play for an Always Open Challenge", () => {
    expect(slotsRequest({ first: "birth_year", last: "current_year", countsPastPlay: true }, "always_open")).toEqual({
      first_year: "birth_year",
      last_year: "current_year",
      counts_past_play: true,
    });
  });

  it("never sends Counts past play on a Seasonal Challenge", () => {
    expect(slotsRequest({ first: 1990, last: 1999, countsPastPlay: true }, "seasonal")).toEqual({
      first_year: 1990,
      last_year: 1999,
      counts_past_play: false,
    });
  });
});

describe("slotsErrors", () => {
  it("passes a birth-year range and a fixed decade", () => {
    expect(slotsErrors(SLOTS_DEFAULTS, 2026)).toEqual({});
    expect(slotsErrors({ first: 1990, last: 1999, countsPastPlay: false }, 2026)).toEqual({});
  });

  it("refuses a first year after the last", () => {
    expect(slotsErrors({ first: 2000, last: 1999, countsPastPlay: false }, 2026)).toEqual({
      slotsFirst: "The first year can't come after the last year.",
    });
  });

  it("refuses a fixed first year after this year when the range grows", () => {
    expect(slotsErrors({ first: 2030, last: "current_year", countsPastPlay: false }, 2026)).toEqual({
      slotsFirst: "The first year can't come after this year.",
    });
  });

  it("keeps years between 1900 and 2100", () => {
    expect(slotsErrors({ first: 1899, last: 2101, countsPastPlay: false }, 2026)).toEqual({
      slotsFirst: "Pick a year from 1900 to 2100.",
      slotsLast: "Pick a year from 1900 to 2100.",
    });
  });
});

describe("slotsCountLine", () => {
  it("works out a birth-year range for a member born 1988", () => {
    expect(slotsCountLine(SLOTS_DEFAULTS, 2026)).toBe(
      "For a member born 1988 that's 39 slots, plus one every 1 January.",
    );
  });

  it("counts a fixed range", () => {
    expect(slotsCountLine({ first: 1990, last: 1999, countsPastPlay: false }, 2026)).toBe("That's 10 slots.");
  });

  it("counts a fixed start that grows", () => {
    expect(slotsCountLine({ first: 2020, last: "current_year", countsPastPlay: false }, 2026)).toBe(
      "That's 7 slots so far, plus one every 1 January.",
    );
  });
});

describe("rulerScale", () => {
  it("runs from 1970 to this year with a tick every 2 years and a label every 10", () => {
    const scale = rulerScale(SLOTS_DEFAULTS, 2026);
    expect(scale.start).toBe(1970);
    expect(scale.end).toBe(2026);
    expect(scale.ticks.filter((t) => t.label).map((t) => t.year)).toEqual([1970, 1980, 1990, 2000, 2010, 2020]);
    expect(scale.ticks.map((t) => t.year).slice(0, 3)).toEqual([1970, 1972, 1974]);
    // The birth-year handle stands at the example member's year.
    expect(scale.values).toEqual([1988, 2026]);
  });

  it("reaches back to a fixed first year's decade and on to a fixed last year", () => {
    const scale = rulerScale({ first: 1958, last: 2030, countsPastPlay: false }, 2026);
    expect(scale.start).toBe(1950);
    expect(scale.end).toBe(2030);
    expect(scale.values).toEqual([1958, 2030]);
  });

  it("places a year as a share of the ruler", () => {
    const scale = rulerScale(SLOTS_DEFAULTS, 2026);
    expect(scale.percent(1970)).toBe(0);
    expect(scale.percent(2026)).toBe(100);
    expect(scale.percent(1998)).toBe(50);
  });
});

describe("lastFromRuler", () => {
  it("makes the range grow when the handle reaches this year", () => {
    expect(lastFromRuler(2026, 2026)).toBe("current_year");
    expect(lastFromRuler(1999, 2026)).toBe(1999);
  });
});
