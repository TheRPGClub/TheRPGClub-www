import { describe, expect, it } from "vitest";

import {
  autosaveLabel,
  discardLoss,
  draftChecklist,
  isDraft,
  savedAgo,
} from "@/lib/reviews/draft";

describe("isDraft", () => {
  it("is a Draft until it has a publish date", () => {
    expect(isDraft({ published_at: null })).toBe(true);
    expect(isDraft({})).toBe(true);
    expect(isDraft({ published_at: "2026-11-23T10:00:00Z" })).toBe(false);
  });
});

describe("draftChecklist", () => {
  it("ticks what is there", () => {
    expect(draftChecklist({ title: "  ", storyLength: 0, rating: null })).toEqual({
      title: false,
      story: false,
      score: false,
    });
    expect(draftChecklist({ title: "Hi", storyLength: 3, rating: 0 })).toEqual({
      title: true,
      story: true,
      score: true,
    });
  });
});

describe("discardLoss", () => {
  it("names everything that goes", () => {
    expect(discardLoss({ rating: 80, hasScorecard: true, storyLength: 412 })).toBe(
      "Its score, scorecard and 412 characters go with it.",
    );
  });
  it("agrees in number", () => {
    expect(discardLoss({ rating: 80, hasScorecard: false, storyLength: 0 })).toBe(
      "Its score goes with it.",
    );
    expect(discardLoss({ rating: null, hasScorecard: false, storyLength: 1 })).toBe(
      "Its 1 character goes with it.",
    );
    expect(discardLoss({ rating: null, hasScorecard: false, storyLength: 1200 })).toBe(
      "Its 1,200 characters go with it.",
    );
  });
  it("says when there is nothing to lose", () => {
    expect(discardLoss({ rating: null, hasScorecard: false, storyLength: 0 })).toBe(
      "It has nothing in it yet.",
    );
  });
});

describe("savedAgo and autosaveLabel", () => {
  const now = Date.UTC(2026, 10, 23, 21, 14);
  it("reads as a relative time, then a date", () => {
    expect(savedAgo(now - 20_000, now)).toBe("just now");
    expect(savedAgo(now - 2 * 60_000, now)).toBe("2 min ago");
    expect(savedAgo(now - 3 * 3_600_000, now)).toBe("3 h ago");
    expect(savedAgo(Date.UTC(2026, 10, 20), now)).toBe("20 Nov");
  });
  it("labels each state", () => {
    expect(autosaveLabel({ kind: "idle" }, now)).toBe("nothing new to save");
    expect(autosaveLabel({ kind: "saving" }, now)).toBe("saving");
    expect(autosaveLabel({ kind: "refused" }, now)).toBe("not saved");
    expect(autosaveLabel({ kind: "saved", at: now }, now)).toBe("saved just now");
    expect(autosaveLabel({ kind: "failed", retryAt: now + 7_200 }, now)).toBe(
      "not saved · retrying in 8s",
    );
    expect(autosaveLabel({ kind: "failed", retryAt: now }, now)).toBe("not saved · retrying");
  });
});
