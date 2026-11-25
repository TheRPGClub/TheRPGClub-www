import { describe, expect, it } from "vitest";

import {
  formatPlaytime,
  parseShelfSorts,
  profilePlaytime,
  shelfSortHref,
  shelfSortQuery,
} from "@/lib/members/profile-playtime";

describe("formatPlaytime", () => {
  it("is whole hours with a thousands separator", () => {
    expect(formatPlaytime(180 * 60)).toBe("180 h");
    expect(formatPlaytime(6912 * 60 + 59)).toBe("6,912 h");
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

  it("sends sort=most_played only for Most played", () => {
    expect(shelfSortQuery("most_played")).toBe("&sort=most_played");
    expect(shelfSortQuery("default")).toBe("");
  });

  it("links one shelf's sort and keeps the others", () => {
    const sorts = parseShelfSorts({ backlog_sort: "most_played" });
    expect(shelfSortHref("42", sorts, "completed", "most_played")).toBe(
      "/members/42?completed_sort=most_played&backlog_sort=most_played",
    );
    expect(shelfSortHref("42", sorts, "backlog", "default")).toBe("/members/42");
  });
});
