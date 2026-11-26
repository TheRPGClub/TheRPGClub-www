import { describe, expect, it } from "vitest";

import {
  addedMonth,
  formatPlaytime,
  parseShelfSorts,
  profilePlaytime,
  shelfSortHref,
  shelfSortQuery,
} from "@/lib/members/profile-playtime";

describe("addedMonth", () => {
  it("reads an added date as the club's month and short year", () => {
    expect(addedMonth("2026-09-26T15:00:00.000Z")).toBe("Sep 26");
  });

  it("uses the club's day: just past midnight UTC is still the day before in New York", () => {
    expect(addedMonth("2026-10-01T02:00:00.000Z")).toBe("Sep 26");
  });

  it("is null without a date (an older API)", () => {
    expect(addedMonth(undefined)).toBeNull();
    expect(addedMonth("nonsense")).toBeNull();
  });
});

describe("formatPlaytime", () => {
  it("is whole hours with a thousands separator, a tenth under 10 h", () => {
    expect(formatPlaytime(180 * 60)).toBe("180 h");
    expect(formatPlaytime(6912 * 60 + 20)).toBe("6,912 h");
    expect(formatPlaytime(390)).toBe("6.5 h");
  });

  it("is minutes under an hour, and 0 h for none", () => {
    expect(formatPlaytime(45)).toBe("45 m");
    expect(formatPlaytime(0)).toBe("0 h");
    expect(formatPlaytime(null)).toBe("0 h");
  });
});

describe("profilePlaytime", () => {
  it("reads the total and the shelves the viewer gets", () => {
    const user = { playtime: { total_minutes: 600, shelves: { favorites: 60, completed: 120 } } };
    expect(profilePlaytime(user)).toEqual({
      total: 600,
      shelves: { favorites: 60, completed: 120 },
    });
  });

  it("is null when the API sends no Playtime", () => {
    expect(profilePlaytime({})).toBeNull();
    expect(profilePlaytime({ playtime: null })).toBeNull();
  });
});

describe("shelf sorts", () => {
  it("reads Most played per shelf and ignores anything else", () => {
    expect(
      parseShelfSorts({ completed_sort: "most_played", backlog_sort: "bogus", favorites_sort: ["most_played"] }),
    ).toEqual({ favorites: "most_played", completed: "most_played", backlog: "default", collection: "default" });
  });

  it("never sorts the Backlog by Most played", () => {
    expect(parseShelfSorts({ backlog_sort: "most_played" }).backlog).toBe("default");
  });

  it("sends sort=most_played only for Most played", () => {
    expect(shelfSortQuery("most_played")).toBe("&sort=most_played");
    expect(shelfSortQuery("default")).toBe("");
  });

  it("links one shelf's sort and keeps the others", () => {
    const sorts = parseShelfSorts({ collection_sort: "most_played" });
    expect(shelfSortHref("42", sorts, "completed", "most_played")).toBe(
      "/members/42?completed_sort=most_played&collection_sort=most_played",
    );
    expect(shelfSortHref("42", sorts, "collection", "default")).toBe("/members/42");
  });
});
