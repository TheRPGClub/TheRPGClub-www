import { describe, expect, it } from "vitest";

import type { ReviewRevision } from "@/lib/api/types";
import {
  headlineTitle,
  isRevisited,
  revisedCount,
  reviewDeleteNote,
  reviewTakes,
  revisionDeleteNote,
  scoreChange,
  scoreRow,
  stopDate,
} from "@/lib/reviews/takes";

const rev = (id: number, rating: number | null, previous: number, at: string | null, title?: string): ReviewRevision => ({
  revision_id: id,
  review_id: 1,
  rating,
  previous_rating: previous,
  title: title ?? null,
  facets: null,
  body: null,
  published_at: at,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
});

const review = {
  rating: 80,
  original_rating: 72,
  title: "Slow march",
  body: null,
  facets: null,
  published_at: "2024-11-12T10:00:00Z",
  created_at: "2024-11-12T10:00:00Z",
  revisions: [rev(5, 85, 72, "2025-03-02T10:00:00Z"), rev(6, 80, 85, "2025-11-14T10:00:00Z", "Third run")],
};

describe("reviewTakes", () => {
  it("lists the first take then each Published Revision, the last current", () => {
    const takes = reviewTakes(review);
    expect(takes.map((t) => [t.label, t.rating, t.previousRating, t.current])).toEqual([
      ["First take", 72, null, false],
      ["Revision 1", 85, 72, false],
      ["Revision 2", 80, 85, true],
    ]);
  });

  it("reads the first take's score from rating on an older shape", () => {
    const takes = reviewTakes({ ...review, original_rating: undefined, revisions: undefined, rating: 64 });
    expect(takes).toHaveLength(1);
    expect(takes[0]).toMatchObject({ rating: 64, current: true });
  });

  it("leaves out a Draft Revision", () => {
    expect(reviewTakes({ ...review, revisions: [rev(9, 90, 72, null)] })).toHaveLength(1);
  });
});

describe("the score line", () => {
  it("rows every score with the change between", () => {
    expect(scoreRow(reviewTakes(review))).toEqual([
      { rating: 72, label: "Nov 24", current: false, change: null },
      { rating: 85, label: "Mar 25", current: false, change: "+13" },
      { rating: 80, label: "Now", current: true, change: "−5" },
    ]);
  });

  it("has no row for a Review never revisited", () => {
    expect(scoreRow(reviewTakes({ ...review, revisions: [] }))).toEqual([]);
  });

  it("words the change under a stop", () => {
    expect(scoreChange(80, 85)).toBe("−5 from 85");
    expect(scoreChange(85, 72)).toBe("+13 from 72");
    expect(scoreChange(80, 80)).toBe("Same as 80");
    expect(scoreChange(72, null)).toBe("The first score");
  });

  it("dates a stop in UTC", () => {
    expect(stopDate("2025-03-02T23:30:00Z")).toEqual({ day: "02", month: "Mar 2025" });
  });
});

describe("the page's words", () => {
  const takes = reviewTakes(review);

  it("counts the returns", () => {
    expect(revisedCount(takes)).toBe("revisited twice");
    expect(revisedCount(takes.slice(0, 1))).toBeNull();
  });

  it("takes the newest title for the headline", () => {
    expect(headlineTitle(takes)).toBe("Third run");
    expect(headlineTitle(takes.slice(0, 2))).toBe("Slow march");
  });

  it("says where the score goes when a Revision is deleted", () => {
    expect(revisionDeleteNote(takes, "revision-6")).toBe(
      "Its take and scorecard go. The score goes back to 85, from Mar 2, 2025.",
    );
    expect(revisionDeleteNote(takes, "revision-5")).toBe("Its take and scorecard go. The score stays as it is.");
  });

  it("says what deleting the Review takes", () => {
    expect(reviewDeleteNote(takes)).toBe("Every take goes with it, all 2 Revisions included.");
    expect(reviewDeleteNote(takes.slice(0, 1))).toBe("Every member loses it, score and all.");
  });
});

describe("isRevisited", () => {
  it("reads the lists' revised flag, else the full shape's Revisions", () => {
    expect(isRevisited({ revised: true })).toBe(true);
    expect(isRevisited({ revised: false })).toBe(false);
    expect(isRevisited({ revisions: [{ published_at: "2026-11-01T00:00:00Z" } as ReviewRevision] })).toBe(true);
    expect(isRevisited({ revisions: [] })).toBe(false);
    expect(isRevisited({})).toBe(false);
  });
});
