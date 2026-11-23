import { describe, expect, it } from "vitest";

import {
  dayRunsOver,
  feedCountNote,
  feedDayHeading,
  feedHref,
  feedState,
  feedTrack,
  groupFeedByDay,
  parseFeedQuery,
  previousScore,
  type ReviewFeedEntry,
} from "./feed";

const entry = (over: Partial<ReviewFeedEntry> = {}): ReviewFeedEntry => ({
  kind: "review",
  review_id: 1,
  user_id: "1",
  gamedb_game_id: 7,
  rating: 80,
  body: null,
  written: true,
  published_at: "2026-11-23T09:14:00Z",
  created_at: "2026-11-23T09:00:00Z",
  ...over,
});

describe("parseFeedQuery and feedHref", () => {
  it("reads the page and Written only, defaulting to the bare feed", () => {
    expect(parseFeedQuery({})).toEqual({ page: 1, written: false });
    expect(parseFeedQuery({ page: "3", written: "1" })).toEqual({ page: 3, written: true });
    expect(parseFeedQuery({ page: "-2", written: "no" })).toEqual({ page: 1, written: false });
  });

  it("leaves the defaults out of the address", () => {
    expect(feedHref({ page: 1, written: false })).toBe("/reviews");
    expect(feedHref({ page: 2, written: false })).toBe("/reviews?page=2");
    expect(feedHref({ page: 4, written: false }, { written: true, page: 1 })).toBe("/reviews?written=1");
    expect(feedHref({ page: 1, written: true }, { page: 2 })).toBe("/reviews?written=1&page=2");
  });
});

describe("feedCountNote", () => {
  it("counts published, or written with the filter on", () => {
    expect(feedCountNote(1284, false)).toBe("1,284 published");
    expect(feedCountNote(312, true)).toBe("312 written");
  });
});

describe("day bands", () => {
  it("groups runs of one UTC day in the API's order", () => {
    const days = groupFeedByDay([
      entry({ review_id: 1, published_at: "2026-11-23T00:10:00Z" }),
      entry({ review_id: 2, published_at: "2026-11-22T23:50:00Z" }),
      entry({ review_id: 3, published_at: "2026-11-22T08:00:00Z" }),
    ]);
    expect(days.map((d) => [d.day, d.entries.map((e) => e.review_id)])).toEqual([
      ["2026-11-23", [1]],
      ["2026-11-22", [2, 3]],
    ]);
  });

  it("names today and yesterday and dates older days", () => {
    const now = new Date("2026-11-23T12:00:00Z");
    expect(feedDayHeading("2026-11-23", 2, now)).toEqual({ title: "Today", note: "Mon 23 Nov · 2 reviews" });
    expect(feedDayHeading("2026-11-22", 1, now)).toEqual({ title: "Yesterday", note: "Sun 22 Nov · 1 review" });
    expect(feedDayHeading("2026-11-21", 4, now, true)).toEqual({ title: "Sat 21 Nov", note: "4 written" });
    expect(feedDayHeading("2025-11-21", null, now)).toEqual({ title: "Fri 21 Nov 2025", note: null });
  });

  it("knows when a day runs over a page edge", () => {
    expect(dayRunsOver("2026-11-23", null)).toBe(false);
    expect(dayRunsOver("2026-11-23", undefined)).toBe(true);
    expect(dayRunsOver("2026-11-23", entry())).toBe(true);
    expect(dayRunsOver("2026-11-22", entry())).toBe(false);
  });
});

describe("a box's parts", () => {
  it("takes the track from the game, GOTM first", () => {
    expect(feedTrack(entry({ game: { game_id: 7, title: "x", cover_url: null, gotm_won: true, nr_gotm_won: true } }))).toBe("gotm");
    expect(feedTrack(entry({ game: { game_id: 7, title: "x", cover_url: null, nr_gotm_won: true } }))).toBe("nr");
    expect(feedTrack(entry())).toBeNull();
  });

  it("marks a Revision Revisited and a score-only take Quick take", () => {
    expect(feedState(entry({ kind: "revision", written: false }))).toBe("revisited");
    expect(feedState(entry({ written: false }))).toBe("quick");
    expect(feedState(entry())).toBeNull();
  });

  it("strikes the replaced score on a Revision only", () => {
    expect(previousScore(entry({ kind: "revision", previous_rating: 72 }))).toBe(72);
    expect(previousScore(entry({ previous_rating: 72 }))).toBeNull();
  });
});
