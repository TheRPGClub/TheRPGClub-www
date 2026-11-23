import { describe, expect, it } from "vitest";

import { formatReviewDate, reviewDate } from "@/lib/reviews/review-date";

describe("formatReviewDate", () => {
  it("reads as the byline does, in UTC", () => {
    expect(formatReviewDate("2025-03-12T23:30:00Z")).toBe("Mar 12, 2025");
    expect(formatReviewDate("2025-03-12T23:30:00Z", "long")).toBe("March 12, 2025");
    expect(formatReviewDate(Date.UTC(2026, 9, 14))).toBe("Oct 14, 2026");
  });
});

describe("reviewDate", () => {
  it("dates a review by its publish date, else when it was written", () => {
    expect(reviewDate({ published_at: "2026-11-02T10:00:00Z", created_at: "2026-10-01T10:00:00Z" })).toBe(
      "2026-11-02T10:00:00Z",
    );
    expect(reviewDate({ published_at: null, created_at: "2026-10-01T10:00:00Z" })).toBe("2026-10-01T10:00:00Z");
    expect(reviewDate({ created_at: "2026-10-01T10:00:00Z" })).toBe("2026-10-01T10:00:00Z");
  });
});
