import { describe, expect, it } from "vitest";

import type { DatePrecision, UpcomingRelease } from "@/lib/api/types";
import {
  calendarHref,
  calendarSections,
  calendarView,
  firstReleasedLabel,
  listNote,
  monthGrid,
  monthNote,
  parseCalendarFilters,
  platformsPhrase,
  regionGroups,
  sectionNote,
  shiftMonth,
  todayLabel,
  todayRuleAt,
} from "@/lib/release-calendar";

const TODAY = "2026-11-17";

function entry(
  gameId: number,
  date: string | null,
  precision: DatePrecision,
  section: string,
  releases: [number, string, string][] = [[1, "PS5", "WW"]],
  first: [string, Exclude<DatePrecision, "tba">] | null = null,
): UpcomingRelease {
  return {
    game: { game_id: gameId, title: `Game ${gameId}`, cover_url: null },
    date,
    date_precision: precision,
    section,
    first_released_on: first?.[0] ?? null,
    first_released_precision: first?.[1] ?? null,
    releases: releases.map(([platform, abbr, region], i) => ({
      release_id: gameId * 100 + i,
      platform_id: platform,
      platform_name: `Platform ${abbr}`,
      platform_abbreviation: abbr,
      region_id: 1,
      region_code: region,
      region_name: region,
      format: null,
      source: "igdb",
    })),
  };
}

describe("parseCalendarFilters", () => {
  it("defaults to today's month and every platform", () => {
    expect(parseCalendarFilters({}, TODAY)).toEqual({ month: "2026-11", platforms: [] });
  });

  it("reads a month and platforms as a comma list or repeats", () => {
    expect(parseCalendarFilters({ month: "2025-09", platform: ["3,5", "5", "x"] }, TODAY)).toEqual({
      month: "2025-09",
      platforms: [3, 5],
    });
  });

  it("drops a malformed month", () => {
    expect(parseCalendarFilters({ month: "2026-13" }, TODAY).month).toBe("2026-11");
  });
});

describe("calendarHref", () => {
  const filters = { month: "2026-11", platforms: [3] };
  it("leaves today's month out of the address", () => {
    expect(calendarHref(filters, {}, TODAY)).toBe("/releases?platform=3");
    expect(calendarHref(filters, { platforms: [] }, TODAY)).toBe("/releases");
  });

  it("keeps another month and a comma list", () => {
    expect(calendarHref(filters, { month: "2026-12", platforms: [3, 5] }, TODAY)).toBe(
      "/releases?month=2026-12&platform=3,5",
    );
  });
});

describe("months", () => {
  it("steps across years", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });

  it("lays a month out Monday first in whole weeks", () => {
    const grid = monthGrid("2026-11");
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual({ day: "2026-10-26", inMonth: false, weekend: false });
    expect(grid[6]).toEqual({ day: "2026-11-01", inMonth: true, weekend: true });
    expect(grid.filter((d) => d.inMonth)).toHaveLength(30);
  });

  it("says today in the club's day", () => {
    expect(todayLabel(TODAY)).toBe("Today · Tue 17 Nov");
  });
});

describe("regionGroups", () => {
  it("lists each region once with its platforms by short name", () => {
    const e = entry(1, "2026-11-19", "day", "November 2026", [
      [1, "Switch", "EU"],
      [1, "Switch", "NA"],
      [2, "Switch 2", "EU"],
      [2, "Switch 2", "NA"],
    ]);
    expect(regionGroups(e).map((g) => [g.code, g.platforms])).toEqual([
      ["EU", ["Switch", "Switch 2"]],
      ["NA", ["Switch", "Switch 2"]],
    ]);
  });
});

describe("firstReleasedLabel", () => {
  it("is null unless the API set it", () => {
    expect(firstReleasedLabel(entry(1, null, "tba", "TBA"))).toBeNull();
  });

  it("reads a day as its month and a vague date at its precision", () => {
    expect(firstReleasedLabel(entry(1, null, "tba", "TBA", undefined, ["2025-09-25", "day"]))).toBe("Sep 2025");
    expect(firstReleasedLabel(entry(1, null, "tba", "TBA", undefined, ["2027-07-01", "quarter"]))).toBe(
      "Q3 2027",
    );
  });
});

describe("calendarSections", () => {
  const entries = [
    entry(1, "2026-12-01", "month", "December 2026"),
    entry(2, "2026-12-03", "day", "December 2026"),
    entry(3, "2026-12-03", "day", "December 2026"),
    entry(4, "2027-07-01", "quarter", "Q3 2027"),
    entry(5, "2027-01-01", "year", "2027"),
    entry(6, null, "tba", "TBA"),
  ];

  it("groups by section, then by date", () => {
    const sections = calendarSections(entries);
    expect(sections.map((s) => [s.title, s.precision, s.month, s.count])).toEqual([
      ["December 2026", "month", "2026-12", 3],
      ["Q3 2027", "quarter", null, 1],
      ["2027", "year", null, 1],
      ["TBA", "tba", null, 1],
    ]);
    expect(sections[0].groups.map((g) => g.entries.length)).toEqual([1, 2]);
  });

  it("notes what a vague section spans", () => {
    expect(sectionNote("quarter", "Q3 2027")).toBe("July to September");
    expect(sectionNote("year", "2027")).toBe("any month");
    expect(sectionNote("tba", "TBA")).toBe("no date announced");
    expect(sectionNote("month", "December 2026")).toBeNull();
  });
});

describe("todayRuleAt", () => {
  const groups = calendarSections([
    entry(1, "2026-11-01", "month", "November 2026"),
    entry(2, "2026-11-05", "day", "November 2026"),
    entry(3, "2026-11-19", "day", "November 2026"),
  ])[0].groups;

  it("sits before the first day from today in today's month", () => {
    expect(todayRuleAt(groups, "2026-11", TODAY)).toBe(2);
    expect(todayRuleAt(groups, "2026-11", "2026-11-30")).toBe(3);
  });

  it("is absent from other months", () => {
    expect(todayRuleAt(groups, "2026-12", TODAY)).toBeNull();
  });
});

describe("calendarView", () => {
  const grid = [
    entry(1, "2026-11-01", "month", "November 2026", [[1, "PS5", "WW"]]),
    entry(2, "2026-11-19", "day", "November 2026", [[2, "Switch 2", "NA"]]),
  ];
  const window = [
    ...grid,
    entry(3, "2026-12-03", "day", "December 2026", [[2, "Switch 2", "WW"]]),
    entry(4, null, "tba", "TBA", [[1, "PS5", "JP"]]),
  ];

  it("leaves what the grid shows out of the list", () => {
    const view = calendarView(grid, window, []);
    expect(view.list.map((e) => e.game.game_id)).toEqual([3, 4]);
    expect(view.fromToday).toBe(4);
    expect([...view.byDay.keys()]).toEqual(["2026-11-19"]);
    expect(view.options.map((o) => o.id)).toEqual([1, 2]);
  });

  it("narrows the grid and the list to the platforms", () => {
    const view = calendarView(grid, window, [2]);
    expect(view.grid.map((e) => e.game.game_id)).toEqual([2]);
    expect(view.list.map((e) => e.game.game_id)).toEqual([3]);
    expect(view.fromToday).toBe(2);
    expect(view.gridAll).toBe(2);
  });

  it("says why the grid or the list is empty", () => {
    const filtered = calendarView(grid, window, [9]);
    expect(monthNote(filtered, { month: "2026-11", platforms: [9] }, TODAY)?.body).toBe(
      "The 2 Upcoming Releases in November 2026 are all on other platforms.",
    );
    expect(listNote(filtered, { month: "2026-11", platforms: [9] })?.clear).toBe(true);
    const none = calendarView([], [], []);
    expect(monthNote(none, { month: "2025-06", platforms: [] }, TODAY)?.title).toBe("No Releases in June 2025");
    expect(monthNote(none, { month: "2027-06", platforms: [] }, TODAY)?.title).toBe(
      "No Releases in June 2027 yet",
    );
  });

  it("names the picked platforms", () => {
    const options = [
      { id: 1, name: "PlayStation 5" },
      { id: 2, name: "Nintendo Switch 2" },
    ];
    expect(platformsPhrase([1], options)).toBe("PlayStation 5");
    expect(platformsPhrase([1, 2], options)).toBe("PlayStation 5 or Nintendo Switch 2");
    expect(platformsPhrase([1, 2, 3], options)).toBe("3 platforms");
  });
});
